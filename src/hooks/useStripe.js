import { useMutation } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { apiClient } from "../lib/api";

function useToken() {
  const { getAccessTokenSilently } = useAuth0();
  return getAccessTokenSilently;
}

/**
 * Create a Stripe Checkout Session and redirect to Stripe.
 * Use: const checkout = useStripeCheckout();
 *      checkout.mutate("basic") or checkout.mutate("pro")
 */
export function useStripeCheckout() {
  const getToken = useToken();

  return useMutation({
    mutationFn: async (plan) => {
      const token = await getToken();
      return apiClient.post("/api/stripe/create-checkout", { plan }, token);
    },
    onSuccess: (data) => {
      // Redirect to Stripe Checkout
      if (data?.data?.url) {
        window.location.href = data.data.url;
      }
    },
  });
}

/**
 * Create a Stripe Customer Portal session and redirect.
 * Use: const portal = useStripePortal();
 *      portal.mutate()
 */
export function useStripePortal() {
  const getToken = useToken();

  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      return apiClient.post("/api/stripe/portal", {}, token);
    },
    onSuccess: (data) => {
      if (data?.data?.url) {
        window.location.href = data.data.url;
      }
    },
  });
}
