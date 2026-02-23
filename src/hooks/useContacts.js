import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/api";
import { buildQueryString } from "../lib/utils";
import { useToken } from "./useToken";

export function useContacts(params = {}) {
  const getToken = useToken();

  return useQuery({
    queryKey: ["contacts", params],
    queryFn: async () => {
      const token = await getToken();
      const qs = buildQueryString(params);
      return apiClient.get(`/api/contacts${qs}`, token);
    },
  });
}

export function useContact(id) {
  const getToken = useToken();

  return useQuery({
    queryKey: ["contacts", id],
    queryFn: async () => {
      const token = await getToken();
      return apiClient.get(`/api/contacts/${id}`, token);
    },
    enabled: !!id,
  });
}

export function useCreateContact() {
  const getToken = useToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const token = await getToken();
      return apiClient.post("/api/contacts", data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
}

export function useUpdateContact() {
  const getToken = useToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const token = await getToken();
      return apiClient.put(`/api/contacts/${id}`, data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
}

export function useDeleteContact() {
  const getToken = useToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const token = await getToken();
      return apiClient.delete(`/api/contacts/${id}`, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
}
