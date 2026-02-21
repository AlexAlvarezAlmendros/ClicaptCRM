import { useQuery } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { apiClient } from "../lib/api";

export function useDashboard() {
  const { getAccessTokenSilently } = useAuth0();

  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const token = await getAccessTokenSilently();
      return apiClient.get("/api/dashboard", token);
    },
    staleTime: 1000 * 60, // 1 min
  });
}
