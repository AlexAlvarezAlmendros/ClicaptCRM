/**
 * DEV-ONLY: Drop-in replacement for @auth0/auth0-react.
 * Activated via VITE_AUTH0_BYPASS=true in .env
 * Vite alias redirects all `@auth0/auth0-react` imports here.
 *
 * ⚠️  DO NOT use in production.
 */
import { createContext, useContext } from "react";

const FAKE_USER = {
  sub: "auth0|dev_bypass",
  email: "dev@leadflow.local",
  name: "Dev User",
  picture: "",
  email_verified: true,
};

const auth0Value = {
  isAuthenticated: true,
  isLoading: false,
  user: FAKE_USER,
  getAccessTokenSilently: async () => "dev-bypass-token",
  getIdTokenClaims: async () => ({ __raw: "dev-token" }),
  loginWithRedirect: () => console.log("[DevAuth0] loginWithRedirect called"),
  loginWithPopup: () => console.log("[DevAuth0] loginWithPopup called"),
  logout: () => {
    console.log("[DevAuth0] logout called");
    window.location.href = "/login";
  },
};

const Auth0Context = createContext(auth0Value);

// Drop-in Auth0Provider replacement — just renders children
export function Auth0Provider({ children }) {
  return (
    <Auth0Context.Provider value={auth0Value}>
      {children}
    </Auth0Context.Provider>
  );
}

// Drop-in useAuth0 replacement
export function useAuth0() {
  return useContext(Auth0Context);
}

// Stub for withAuthenticationRequired HOC
export const withAuthenticationRequired = (Component) => Component;
