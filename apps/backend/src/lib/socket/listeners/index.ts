import { ServerEventMap } from "@pingxy/shared/types";

export type BusListener = {
  [K in keyof ServerEventMap]?: (
    data: ServerEventMap[K],
  ) => void | Promise<void>;
};
