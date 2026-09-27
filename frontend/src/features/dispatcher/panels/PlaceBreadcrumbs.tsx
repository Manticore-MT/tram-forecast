import { cn } from "@/lib/utils";
import { Badge, Card, Icon } from "../../../components";
import { useDispatcher } from "../store";
import { useScenarioActive } from "../forecast";

const crumb = "bg-transparent border-0 cursor-pointer p-0";

export function PlaceBreadcrumbs() {
  const place = useDispatcher((s) => s.place);
  const goTo = useDispatcher((s) => s.goTo);
  const scenario = useScenarioActive();

  return (
    <Card tone="glass" padding="var(--space-2) var(--space-4)">
      <div className="flex items-center gap-2 text-ui-s">
        <button onClick={() => goTo({ level: "network" })} className={cn(crumb, place.level === "network" ? "text-text-primary" : "text-text-muted")}>
          Вся сеть
        </button>
        {place.level !== "network" && (
          <>
            <Icon name="chevron-right" size={14} />
            <button
              onClick={() => goTo({ level: "route", routeId: place.routeId })}
              className={cn(crumb, place.level === "route" ? "text-text-primary" : "text-text-muted")}
            >
              Маршрут № {place.routeId}
            </button>
          </>
        )}
        {scenario && <span className="ml-2"><Badge tone="accent">Сценарий изменён</Badge></span>}
      </div>
    </Card>
  );
}
