import { toast } from "sonner";
import { ApiError, type ApiErrorCode } from "../api/client";

export interface ErrorDescription {
  title: string;
  hint?: string;
  tone: "error" | "info";
  retryable: boolean;
}

const BY_CODE: Record<ApiErrorCode, ErrorDescription> = {
  INVALID_REQUEST: {
    title: "Некорректный запрос",
    hint: "Проверьте выбранные параметры и повторите попытку.",
    tone: "error",
    retryable: false,
  },
  INVALID_PARAMETER: {
    title: "Некорректный параметр",
    hint: "Проверьте выбранные параметры и повторите попытку.",
    tone: "error",
    retryable: false,
  },
  ROUTE_NOT_FOUND: {
    title: "Нет прогноза по маршруту",
    hint: "Этого маршрута нет в данных модели.",
    tone: "error",
    retryable: false,
  },
  STOP_NOT_FOUND: {
    title: "Нет прогноза по остановке",
    hint: "Этой остановки нет в данных модели.",
    tone: "error",
    retryable: false,
  },
  NO_DATA: {
    title: "Нет данных за этот период",
    hint: "Попробуйте выбрать другую дату.",
    tone: "info",
    retryable: false,
  },
  ENDPOINT_NOT_FOUND: {
    title: "Сервис недоступен",
    hint: "Обратитесь к команде разработки.",
    tone: "error",
    retryable: false,
  },
  METHOD_NOT_ALLOWED: {
    title: "Операция недоступна",
    hint: "Обратитесь к команде разработки.",
    tone: "error",
    retryable: false,
  },
  FORECAST_NOT_READY: {
    title: "Прогноз готовится",
    hint: "Обновится автоматически через несколько секунд.",
    tone: "info",
    retryable: false,
  },
  UNAUTHORIZED: {
    title: "Сессия истекла",
    hint: "Войдите заново.",
    tone: "error",
    retryable: false,
  },
  INTERNAL_ERROR: {
    title: "Ошибка сервера",
    hint: "Попробуйте ещё раз через некоторое время.",
    tone: "error",
    retryable: true,
  },
};

const NETWORK_ERROR: ErrorDescription = {
  title: "Нет соединения с сервером",
  hint: "Проверьте подключение к сети и повторите попытку.",
  tone: "error",
  retryable: true,
};

const UNKNOWN_ERROR: ErrorDescription = {
  title: "Не удалось загрузить данные",
  hint: undefined,
  tone: "error",
  retryable: true,
};

export function describeError(error: unknown): ErrorDescription {
  if (error instanceof ApiError) {
    if (error.code && error.code in BY_CODE) return BY_CODE[error.code];
    return UNKNOWN_ERROR;
  }
  if (error instanceof TypeError) return NETWORK_ERROR;
  return UNKNOWN_ERROR;
}

export function notifyError(error: unknown): void {
  const { title, hint, tone } = describeError(error);
  const notify = tone === "info" ? toast.info : toast.error;
  notify(title, hint ? { description: hint } : undefined);
}
