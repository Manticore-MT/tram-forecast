import { Icon } from "../components";
import { describeError } from "./errors";

/** Per-widget error state: each panel shows its own instead of a global toast. */
export function ErrorNotice({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const { title, hint, tone, retryable } = describeError(error);
  return (
    <div className="flex items-start gap-3 rounded-md bg-bg-surface-2 p-4 shadow-(--inset-hairline)">
      <Icon name={tone === "info" ? "info" : "triangle-alert"} size={16} style={{ marginTop: 2 }} />
      <div className="flex-1 min-w-0">
        <div className="text-body-s text-text-secondary">{title}</div>
        {hint && <div className="mt-1 text-caption text-text-muted">{hint}</div>}
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
