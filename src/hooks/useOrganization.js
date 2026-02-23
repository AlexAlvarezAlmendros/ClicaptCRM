import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/api";
import { useToken } from "./useToken";

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

export function useInviteMember() {
  const getToken = useToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const token = await getToken();
      return apiClient.post("/api/organization/members", data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization", "members"] });
    },
  });
}

