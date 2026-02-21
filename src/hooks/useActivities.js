import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { apiClient } from "../lib/api";
import { buildQueryString } from "../lib/utils";

function useToken() {
  const { getAccessTokenSilently } = useAuth0();
  return getAccessTokenSilently;
}

export function useActivities(params = {}) {
  const getToken = useToken();

  return useQuery({
    queryKey: ["activities", params],
    queryFn: async () => {
      const token = await getToken();
      const qs = buildQueryString(params);
      return apiClient.get(`/api/activities${qs}`, token);
    },
  });
}

export function useCreateActivity() {
  const getToken = useToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const token = await getToken();
      return apiClient.post("/api/activities", data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });
}
