import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SimpleAuthProvider } from "@alexalvarez.dev/react";
import { simpleAuthConfig } from "./lib/auth";
import { ToastProvider } from "./components/ui/Toast";
import { AppRouter } from "./routes/AppRouter";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 min
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <SimpleAuthProvider
      domain={simpleAuthConfig.domain}
      clientId={simpleAuthConfig.clientId}
    >
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AppRouter />
        </ToastProvider>
      </QueryClientProvider>
    </SimpleAuthProvider>
  );
}
