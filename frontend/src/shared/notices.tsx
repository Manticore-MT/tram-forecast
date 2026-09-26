import { Icon } from "../components";
import { ApiError } from "../api/client";

/** Per-widget error state: each panel shows its own instead of a global toast. */
export function ErrorNotice({ error }: { error: unknown }) {
  const message = error instanceof ApiError ? error.detail ?? error.message : "Не удалось загрузить данные";
  return (
    <div className="flex items-center gap-3 rounded-md bg-bg-surface-2 p-4 shadow-(--inset-hairline)">
      <Icon name="alert-triangle" size={16} />
      <span className="text-body-s text-text-secondary">{message}</span>
    </div>
  );
}

export function LoadingNotice() {
  return <span className="text-caption text-text-muted">Загрузка…</span>;
}
