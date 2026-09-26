import { API_BASE_URL } from "./client";

const STORAGE_KEY = "tram_auth";

export class AuthError extends Error {}

export function isAuthenticated(): boolean {
  return sessionStorage.getItem(STORAGE_KEY) !== null;
}

export function getAuthHeader(): Record<string, string> {
  const token = sessionStorage.getItem(STORAGE_KEY);
  return token ? { Authorization: `Basic ${token}` } : {};
}

export function logout(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

export async function login(username: string, password: string): Promise<void> {
  const token = btoa(`${username}:${password}`);
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/api/meta`, {
      headers: { Authorization: `Basic ${token}` },
    });
  } catch {
    throw new AuthError("Не удалось подключиться к серверу");
  }
  if (res.status === 401) {
    throw new AuthError("Неверное имя пользователя или пароль");
  }
  if (res.status === 429) {
    const seconds = Number(res.headers.get("Retry-After")) || 10;
    throw new AuthError(`Слишком много неудачных попыток. Повторите через ${seconds} с.`);
  }
  if (!res.ok) {
    throw new AuthError("Не удалось подключиться к серверу");
  }
  sessionStorage.setItem(STORAGE_KEY, token);
}
