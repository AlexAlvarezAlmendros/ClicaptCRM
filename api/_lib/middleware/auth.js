// LeadFlow CRM — Middleware — JWT Authentication (stub)
// TODO-AGENTE-3: Replace this stub with real Auth0 JWT verification

import { createRemoteJWKSet, jwtVerify } from "jose";

const JWKS = process.env.AUTH0_DOMAIN
  ? createRemoteJWKSet(
      new URL(`https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`)
    )
  : null;

/**
 * Verifies the JWT token from the Authorization header.
 * Returns the authenticated user's info.
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
      issuer: `https://${process.env.AUTH0_DOMAIN}/`,
      audience: process.env.AUTH0_AUDIENCE,
    });

    return {
      auth0Id: payload.sub,
      email: payload.email,
      permissions: payload.permissions || [],
    };
  } catch (err) {
    throw { status: 401, code: "UNAUTHORIZED", message: "Token inválido o expirado" };
  }
}
