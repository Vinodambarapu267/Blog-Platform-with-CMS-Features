import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import "./index.css";
import App from "./App.tsx";
import { ErrorBoundary } from "./components/error-boundary";
import { AuthProvider } from "./contexts/auth-context";
import { ThemeProvider } from "./contexts/theme-context";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <ErrorBoundary>
              <App />
            </ErrorBoundary>
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: "#0e1526",
                  color: "#f4f6fb",
                  border: "1px solid rgba(255,255,255,0.12)",
                  fontSize: "13px",
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);
