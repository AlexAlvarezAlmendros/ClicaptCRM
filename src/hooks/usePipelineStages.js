import { useQuery } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";
import { apiClient } from "../lib/api";

function useToken() {
  const { getAccessTokenSilently } = useAuth0();
  return getAccessTokenSilently;
}

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
