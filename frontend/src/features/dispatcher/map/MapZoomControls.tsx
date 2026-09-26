import type { RefObject } from "react";
import { Card, Icon, IconButton, Tooltip } from "../../../components";
import type { MapHandle } from "./MapCanvas";

/** Camera pill next to the breadcrumbs. Kept apart from them on purpose: breadcrumbs say where
 *  you are in the network, this only moves the map. */
export function MapZoomControls({ map }: { map: RefObject<MapHandle | null> }) {
  return (
    <Card tone="glass" padding="2px" className="flex items-center">
      <Tooltip content="Отдалить">
        <IconButton variant="ghost" size="sm" label="Отдалить" icon={<Icon name="minus" size={16} />} onClick={() => map.current?.zoomOut()} />
      </Tooltip>
      <Tooltip content="Приблизить">
        <IconButton variant="ghost" size="sm" label="Приблизить" icon={<Icon name="plus" size={16} />} onClick={() => map.current?.zoomIn()} />
      </Tooltip>
      <Tooltip content="Вписать в экран">
        <IconButton variant="ghost" size="sm" label="Вписать в экран" icon={<Icon name="scan" size={16} />} onClick={() => map.current?.fit()} />
      </Tooltip>
    </Card>
  );
}
