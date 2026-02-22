// LeadFlow CRM — Middleware — JWT Authentication

import { createRemoteJWKSet, jwtVerify } from "jose";

const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;

const JWKS = AUTH0_DOMAIN
  ? createRemoteJWKSet(
      new URL(`https://${AUTH0_DOMAIN}/.well-known/jwks.json`)
    )
  : null;

/**
 * Verifies the JWT token from the Authorization header.
 * Returns the authenticated user's info including email.
 *
 * If the access token doesn't contain the email claim (common with Auth0),
 * fetches it from the /userinfo endpoint automatically.
 *
 * STUB MODE: If AUTH0_DOMAIN is not set, returns a fake user for development.
 */
export async function verifyAuth(req) {
  const authHeader = req.headers.authorization;

  // ── Stub mode for local development ──
  if (!JWKS) {
    console.warn("[auth] Running in STUB mode — no Auth0 verification");
    return {
      auth0Id: "auth0|dev_user_001",
      email: "dev@leadflow.app",
      permissions: [],
    };
  }

  // ── Real Auth0 verification ──
  if (!authHeader?.startsWith("Bearer ")) {
    throw { status: 401, code: "UNAUTHORIZED", message: "Token no proporcionado" };
  }

  const token = authHeader.split(" ")[1];

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://${AUTH0_DOMAIN}/`,
      audience: process.env.AUTH0_AUDIENCE,
    });

    let email = payload.email || payload["https://leadflow.app/email"];

    // If email is not in the token, fetch from Auth0 /userinfo
    if (!email && AUTH0_DOMAIN) {
      try {
        const res = await fetch(`https://${AUTH0_DOMAIN}/userinfo`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const profile = await res.json();
          email = profile.email;
        }
      } catch (e) {
        console.warn("[auth] Failed to fetch /userinfo:", e.message);
      }
    }

    return {
      auth0Id: payload.sub,
      email: email || null,
      permissions: payload.permissions || [],
    };
  } catch (err) {
    throw { status: 401, code: "UNAUTHORIZED", message: "Token inválido o expirado" };
  }
}
