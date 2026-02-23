import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/api";
import { buildQueryString } from "../lib/utils";
import { useToken } from "./useToken";

export function useDeals(params = {}) {
  const getToken = useToken();

  return useQuery({
    queryKey: ["deals", params],
    queryFn: async () => {
      const token = await getToken();
      const qs = buildQueryString(params);
      return apiClient.get(`/api/deals${qs}`, token);
    },
  });
}

export function useDeal(id) {
  const getToken = useToken();

  return useQuery({
    queryKey: ["deals", id],
    queryFn: async () => {
      const token = await getToken();
      return apiClient.get(`/api/deals/${id}`, token);
    },
    enabled: !!id,
  });
}

export function useCreateDeal() {
  const getToken = useToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const token = await getToken();
      return apiClient.post("/api/deals", data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
    },
  });
}

export function useUpdateDeal() {
  const getToken = useToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const token = await getToken();
      return apiClient.put(`/api/deals/${id}`, data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
    },
  });
}

export function useMoveDealStage() {
  const getToken = useToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, stageId, position }) => {
      const token = await getToken();
      return apiClient.patch(`/api/deals/${id}`, { stage_id: stageId, position }, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
    },
  });
}

export function useDeleteDeal() {
  const getToken = useToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const token = await getToken();
      return apiClient.delete(`/api/deals/${id}`, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
    },
  });
}
