import type { ReactNode } from "react";
import { ErrorNotice, LoadingNotice } from "../../../shared/notices";

export interface GateQuery {
  data?: unknown;
  isError: boolean;
  error: unknown;
  refetch: () => unknown;
}

/** Error with retry, or «Загрузка…» until the first answer, else the content. */
export function QueryGate({ q, children }: { q: GateQuery; children: () => ReactNode }) {
  if (q.isError) return <ErrorNotice error={q.error} onRetry={() => void q.refetch()} />;
  if (q.data === undefined) return <LoadingNotice />;
  return <>{children()}</>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="text-body-s text-text-muted">{children}</div>;
}

export const TONE_TEXT = {
  ok: "text-status-ok",
  warn: "text-status-warn",
  danger: "text-status-danger",
} as const;
