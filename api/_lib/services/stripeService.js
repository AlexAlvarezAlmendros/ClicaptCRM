// LeadFlow CRM — Services — Stripe logic

import Stripe from "stripe";
import db from "../db/client.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
});

export const PRICE_MAP = {
  basic: process.env.STRIPE_PRICE_BASIC,
  pro: process.env.STRIPE_PRICE_PRO,
};

/**
 * Get or create a Stripe Customer for the given organization.
 */
async function getOrCreateCustomer(orgId, email, orgName) {
  const result = await db.execute({
    sql: "SELECT stripe_customer_id FROM organizations WHERE id = ?",
    args: [orgId],
  });

  const org = result.rows[0];
  if (org?.stripe_customer_id) {
    return org.stripe_customer_id;
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email,
    name: orgName,
    metadata: { orgId },
  });

  await db.execute({
    sql: "UPDATE organizations SET stripe_customer_id = ?, updated_at = datetime('now') WHERE id = ?",
    args: [customer.id, orgId],
  });

  return customer.id;
}

/**
 * Create a Stripe Checkout Session for a subscription.
 * @param {Object} params
 * @param {string} params.orgId
 * @param {string} params.plan - "basic" or "pro"
 * @param {string} params.email
 * @param {string} params.orgName
 * @param {string} params.successUrl
 * @param {string} params.cancelUrl
 */
export async function createCheckoutSession({ orgId, plan, email, orgName, successUrl, cancelUrl }) {
  const priceId = PRICE_MAP[plan];
  if (!priceId) {
    throw { status: 400, code: "INVALID_PLAN", message: `Plan inválido: ${plan}` };
  }

  const customerId = await getOrCreateCustomer(orgId, email, orgName);

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { orgId, plan },
    subscription_data: {
      metadata: { orgId, plan },
    },
    allow_promotion_codes: true,
  });

  return { sessionId: session.id, url: session.url };
}

/**
 * Create a Stripe Customer Portal session to manage subscription.
 */
export async function createPortalSession({ orgId, returnUrl }) {
  const result = await db.execute({
    sql: "SELECT stripe_customer_id FROM organizations WHERE id = ?",
    args: [orgId],
  });

  const customerId = result.rows[0]?.stripe_customer_id;
  if (!customerId) {
    throw { status: 400, code: "NO_CUSTOMER", message: "No hay una suscripción asociada." };
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return { url: session.url };
}

/**
 * Handle Stripe webhook events (called from webhook endpoint).
 * Updates organization plan and subscription status in DB.
 */
export async function handleWebhookEvent(event) {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const orgId = session.metadata?.orgId;
      const plan = session.metadata?.plan;
      if (orgId && plan) {
        await db.execute({
          sql: `UPDATE organizations
                SET plan = ?, subscription_status = 'active',
                    stripe_subscription_id = ?, updated_at = datetime('now')
                WHERE id = ?`,
          args: [plan, session.subscription, orgId],
        });
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object;
      const orgId = subscription.metadata?.orgId;
      if (!orgId) break;

      let status = "active";
      if (subscription.status === "past_due") status = "past_due";
      if (subscription.status === "canceled") status = "cancelled";
      if (subscription.status === "unpaid") status = "expired";

      // Detect plan from price
      const priceId = subscription.items?.data?.[0]?.price?.id;
      let plan = null;
      if (priceId === PRICE_MAP.basic) plan = "basic";
      if (priceId === PRICE_MAP.pro) plan = "pro";

      const updates = [`subscription_status = '${status}'`, "updated_at = datetime('now')"];
      if (plan) updates.push(`plan = '${plan}'`);

      await db.execute({
        sql: `UPDATE organizations SET ${updates.join(", ")} WHERE stripe_subscription_id = ?`,
        args: [subscription.id],
      });
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      await db.execute({
        sql: `UPDATE organizations
              SET subscription_status = 'cancelled', plan = 'cancelled',
                  updated_at = datetime('now')
              WHERE stripe_subscription_id = ?`,
        args: [subscription.id],
      });
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object;
      if (invoice.subscription) {
        await db.execute({
          sql: `UPDATE organizations SET subscription_status = 'past_due',
                updated_at = datetime('now')
                WHERE stripe_subscription_id = ?`,
          args: [invoice.subscription],
        });
      }
      break;
    }

    default:
      // Unhandled event type — ignore
      break;
  }
}

/**
 * Construct a Stripe webhook event from the raw body + signature.
 */
export function constructWebhookEvent(rawBody, signature) {
  return stripe.webhooks.constructEvent(
    rawBody,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
}

