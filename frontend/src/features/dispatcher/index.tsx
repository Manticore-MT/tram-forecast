import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Tabs, IconButton, Icon, Tooltip } from "../../components";
import { DispatcherScreen } from "./DispatcherScreen";
import { OverviewScreen } from "./OverviewScreen";
import { logout } from "../../api/auth";
import { ExportButton } from "./ExportButton";
import { useDispatcher, type View } from "./store";

/** App shell: the dispatcher map screen (US1-6) and the stakeholder overview grid (US7-10). */
export default function DispatcherApp() {
  const screen = useDispatcher((s) => s.view);
  const setScreen = useDispatcher((s) => s.setView);
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
          <Tabs value={screen} onChange={(v) => setScreen(v as View)} items={[
            { value: "dispatcher", label: "Диспетчер" },
            { value: "overview", label: "Обзор" },
          ]} />
        </div>
        <div className="flex items-center gap-3">
          {screen === "dispatcher" && <ExportButton />}
          <Tooltip content="Выйти">
            <IconButton label="Выйти" icon={<Icon name="log-out" size={18} />} onClick={handleLogout} />
          </Tooltip>
        </div>
      </div>
      <div className={cn("min-h-0 flex-1", full ? "overflow-hidden" : "overflow-y-auto")}>
        {screen === "dispatcher" ? <DispatcherScreen /> : <OverviewScreen />}
      </div>
    </div>
  );
}
