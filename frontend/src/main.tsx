import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { Toaster } from "./components/ui/sonner";
import { ApiError } from "./api/client";
import "./styles/index.css";

function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError) {
    if (error.code === "FORECAST_NOT_READY") return failureCount < 6;
    if (error.status >= 500) return failureCount < 2;
    return false;
  }
  // network failures (TypeError from fetch) and anything else unrecognized
  return failureCount < 2;
}

function retryDelay(failureCount: number, error: unknown): number {
  if (error instanceof ApiError && error.code === "FORECAST_NOT_READY") return 3000;
  return Math.min(1000 * 2 ** failureCount, 5000);
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: shouldRetry, retryDelay },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster theme="dark" position="bottom-right" />
    </QueryClientProvider>
  </React.StrictMode>,
);
