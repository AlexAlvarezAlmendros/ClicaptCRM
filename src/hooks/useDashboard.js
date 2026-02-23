import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../lib/api";
import { useToken } from "./useToken";

export function useDashboard() {
  const getToken = useToken();

  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const token = await getToken();
      return apiClient.get("/api/dashboard", token);
    },
    staleTime: 1000 * 60, // 1 min
  });
}
