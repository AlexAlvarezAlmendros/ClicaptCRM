import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { apiClient } from "../lib/api";
import { buildQueryString } from "../lib/utils";

function useToken() {
  const { getAccessTokenSilently } = useAuth0();
  return getAccessTokenSilently;
}

export function useTasks(params = {}) {
  const getToken = useToken();

  return useQuery({
    queryKey: ["tasks", params],
    queryFn: async () => {
      const token = await getToken();
      const qs = buildQueryString(params);
      return apiClient.get(`/api/tasks${qs}`, token);
    },
  });
}

export function useTask(id) {
  const getToken = useToken();

  return useQuery({
    queryKey: ["tasks", id],
    queryFn: async () => {
      const token = await getToken();
      return apiClient.get(`/api/tasks/${id}`, token);
    },
    enabled: !!id,
  });
}

export function useCreateTask() {
  const getToken = useToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const token = await getToken();
      return apiClient.post("/api/tasks", data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useUpdateTask() {
  const getToken = useToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const token = await getToken();
      return apiClient.put(`/api/tasks/${id}`, data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useCompleteTask() {
  const getToken = useToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const token = await getToken();
      return apiClient.patch(`/api/tasks/${id}`, { is_completed: true }, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
