import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/api";
import { buildQueryString } from "../lib/utils";
import { useToken } from "./useToken";

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
