import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Input } from "../../components";
import { login } from "../../api/auth";

export default function LoginScreen() {
  const navigate = useNavigate();
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [pending, setPending] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    setPending(true);
    try {
      await login(username, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось войти");
    } finally {
      setPending(false);
    }
  }

  return (
    <div style={{ display: "grid", placeItems: "center", height: "100vh", background: "var(--bg-page)" }}>
      <Card tone="surface" padding="var(--space-8)" style={{ width: 360 }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
          <div style={{ font: "var(--type-h4)" }}>Вход в панель прогнозов</div>
          <Input
            label="Имя пользователя"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={pending}
          />
          <Input
            label="Пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error}
            disabled={pending}
          />
          <Button as="button" block disabled={pending}>
            {pending ? "Входим…" : "Войти"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
