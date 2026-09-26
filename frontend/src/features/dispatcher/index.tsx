import React from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Tabs, IconButton, Icon, Tooltip } from "../../components";
import { DispatcherScreen } from "./DispatcherScreen";
import { OverviewScreen } from "./OverviewScreen";
import { logout } from "../../api/auth";

type Screen = "dispatcher" | "overview";

/** App shell: the dispatcher map screen (US1-6) and the stakeholder overview grid (US7-10). */
export default function DispatcherApp() {
  const [screen, setScreen] = React.useState<Screen>("dispatcher");
  const navigate = useNavigate();
  const full = screen === "dispatcher";

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="flex h-screen flex-col bg-bg-page px-8 py-6 text-text-primary">
      <div className="mb-6 flex flex-none items-start justify-between gap-2">
        <div className="flex flex-col gap-2">
          <div className="mt-eyebrow">Поток · прогноз загрузки трамваев</div>
          <Tabs value={screen} onChange={(v) => setScreen(v as Screen)} items={[
            { value: "dispatcher", label: "Диспетчер" },
            { value: "overview", label: "Обзор" },
          ]} />
        </div>
        <Tooltip content="Выйти">
          <IconButton label="Выйти" icon={<Icon name="log-out" size={18} />} onClick={handleLogout} />
        </Tooltip>
      </div>
      <div className={cn("min-h-0 flex-1", full ? "overflow-hidden" : "overflow-y-auto")}>
        {screen === "dispatcher" ? <DispatcherScreen /> : <OverviewScreen />}
      </div>
    </div>
  );
}
