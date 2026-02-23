import { useAuthContext } from "@alexalvarez.dev/react";

/**
 * Returns an async-compatible function that retrieves the current access token.
 * Drop-in replacement for the Auth0 getAccessTokenSilently pattern.
 */
export function useToken() {
  const { tokenManager } = useAuthContext();
  return async () => tokenManager.getAccessToken();
}
