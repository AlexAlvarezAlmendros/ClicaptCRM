import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/api";
import { useToken } from "./useToken";

export function usePipelineStages() {
  const getToken = useToken();

  return useQuery({
    queryKey: ["pipeline-stages"],
    queryFn: async () => {
      const token = await getToken();
      return apiClient.get("/api/pipeline/stages", token);
    },
    staleTime: 5 * 60 * 1000, // stages rarely change
  });
}

export function useUpdatePipelineStages() {
  const getToken = useToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (stages) => {
      const token = await getToken();
      return apiClient.put("/api/pipeline/stages", { stages }, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-stages"] });
      queryClient.invalidateQueries({ queryKey: ["deals"] });
    },
  });
}
