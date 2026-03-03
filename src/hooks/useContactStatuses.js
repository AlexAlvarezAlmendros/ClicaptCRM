import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/api";
import { useToken } from "./useToken";

const FALLBACK_STATUSES = [
  { value: "new",       name: "Nuevo",       color: "#3B82F6", position: 1 },
  { value: "contacted", name: "Contactado",  color: "#F59E0B", position: 2 },
  { value: "qualified", name: "Cualificado", color: "#8B5CF6", position: 3 },
  { value: "customer",  name: "Cliente",     color: "#10B981", position: 4 },
  { value: "lost",      name: "Perdido",     color: "#EF4444", position: 5 },
];

export function useContactStatuses() {
  const getToken = useToken();

  return useQuery({
    queryKey: ["contact-statuses"],
    queryFn: async () => {
      const token = await getToken();
      return apiClient.get("/api/contact-statuses", token);
    },
    staleTime: 10 * 60 * 1000,
    placeholderData: FALLBACK_STATUSES,
  });
}

export function useUpdateContactStatuses() {
  const getToken = useToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (statuses) => {
      const token = await getToken();
      return apiClient.put("/api/contact-statuses", { statuses }, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-statuses"] });
    },
  });
}

/** Utility: look up a status definition by value from an array, with fallback */
export function findStatus(statuses, value) {
  return (
    statuses?.find((s) => s.value === value) ||
    FALLBACK_STATUSES.find((s) => s.value === value) || {
      value: value || "new",
      name: value || "Nuevo",
      color: "#6B7280",
    }
  );
}
