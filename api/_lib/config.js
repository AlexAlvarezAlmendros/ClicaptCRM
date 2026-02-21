// LeadFlow CRM — Config — Centralized environment variables

const config = {
  // Auth0
  auth0: {
    domain: process.env.AUTH0_DOMAIN,
    audience: process.env.AUTH0_AUDIENCE,
  },

  // Turso
  db: {
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },

  // Stripe
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    priceBasic: process.env.STRIPE_PRICE_BASIC,
    pricePro: process.env.STRIPE_PRICE_PRO,
  },

  // Email
  email: {
    user: process.env.GMAIL_USER,
    password: process.env.GMAIL_APP_PASSWORD,
  },

  // App
  app: {
    url: process.env.APP_URL || "http://localhost:5173",
    cronSecret: process.env.CRON_SECRET,
  },
};

export default config;
