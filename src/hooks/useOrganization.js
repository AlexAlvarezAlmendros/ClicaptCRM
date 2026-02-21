import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { apiClient } from "../lib/api";

function useToken() {
  const { getAccessTokenSilently } = useAuth0();
  return getAccessTokenSilently;
}

export function useOrganization() {
  const getToken = useToken();

  return useQuery({
    queryKey: ["organization"],
    queryFn: async () => {
      const token = await getToken();
      return apiClient.get("/api/organization", token);
    },
  });
}

export function useOrganizationMembers() {
  const getToken = useToken();

  return useQuery({
    queryKey: ["organization", "members"],
    queryFn: async () => {
      const token = await getToken();
      return apiClient.get("/api/organization/members", token);
    },
  });
}

export function useUpdateOrganization() {
  const getToken = useToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const token = await getToken();
      return apiClient.put("/api/organization", data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization"] });
    },
  });
}
