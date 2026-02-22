import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { apiClient } from "../lib/api";

function useToken() {
  const { getAccessTokenSilently } = useAuth0();
  return getAccessTokenSilently;
}

export function useProfile() {
  const getToken = useToken();

  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const token = await getToken();
      return apiClient.get("/api/me", token);
    },
  });
}

export function useUpdateProfile() {
  const getToken = useToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const token = await getToken();
      return apiClient.put("/api/me", data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
