import { Icon } from "../components";
import { cn } from "../lib/utils";
import { describeError } from "./errors";

/** Per-widget error state: each panel shows its own instead of a global toast. */
export function ErrorNotice({
  error,
  onRetry,
  hintOverride,
}: {
  error: unknown;
  onRetry?: () => void;
  /** Replaces the generic per-code hint when it doesn't fit this query (e.g. a date-picking tip on an endpoint with no date param). */
  hintOverride?: string;
}) {
  const { title, hint, tone, retryable } = describeError(error);
  const shownHint = hintOverride ?? hint;
  const isInfo = tone === "info";
  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4",
        isInfo
          ? "rounded-none p-0"
          : "rounded-md border-l-2 border-l-status-danger bg-(--control-surface,var(--bg-surface-2)) shadow-(--inset-hairline)"
      )}
    >
      <Icon
        name={isInfo ? "info" : "triangle-alert"}
        size={16}
        className={isInfo ? "text-text-muted" : "text-status-danger"}
        style={{ marginTop: 2 }}
      />
      <div className="flex-1 min-w-0">
        <div className="text-body-s text-text-secondary">{title}</div>
        {shownHint && <div className="mt-1 text-caption text-text-muted">{shownHint}</div>}
      </div>
      {retryable && onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="shrink-0 text-caption text-text-secondary underline underline-offset-2 hover:text-text-primary"
        >
          Повторить
        </button>
      )}
    </div>
  );
}

export function LoadingNotice() {
  return <span className="text-caption text-text-muted">Загрузка…</span>;
}
