// LeadFlow CRM — Middleware — JWT Authentication (SimpleAuth)

import { verifyToken } from "@alexalvarez.dev/node";

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Verifies the JWT token from the Authorization header using SimpleAuth.
 * Returns the authenticated user's info including email.
 *
 * STUB MODE: If JWT_SECRET is not set, returns a fake user for development.
 */
export async function verifyAuth(req) {
  const authHeader = req.headers.authorization;

  // ── Stub mode for local development ──
  if (!JWT_SECRET) {
    console.warn("[auth] Running in STUB mode — no JWT verification");
    return {
      auth0Id: "dev_user_001",
      email: "dev@leadflow.app",
      permissions: [],
    };
  }

  // ── Real SimpleAuth verification ──
  if (!authHeader?.startsWith("Bearer ")) {
    throw { status: 401, code: "UNAUTHORIZED", message: "Token no proporcionado" };
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = await verifyToken(token, {
      secret: JWT_SECRET,
    });

    return {
      auth0Id: payload.sub,
      email: payload.email || null,
      name: payload.name || null,
      permissions: payload.permissions || [],
      roles: payload.roles || [],
    };
  } catch (err) {
    throw { status: 401, code: "UNAUTHORIZED", message: "Token inválido o expirado" };
  }
}
