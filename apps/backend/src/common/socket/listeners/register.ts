import { eventBus } from "@common/events";
import { BusListener } from "./index";

export function registerBusListeners(...handlerGroups: BusListener[]) {
  for (const group of handlerGroups) {
    Object.entries(group).forEach(([event, handler]) => {
      if (handler) {
        eventBus.on(event, handler as any);
      }
    });
  }
}
