import { SERVER_EVENTS } from "@pingxy/shared/constants";
import { BusListener } from "./index";
import { connectionManager } from "../connectionManager";


export const receiptListener: BusListener = {
  [SERVER_EVENTS.RECEIPTS.DELIVERED]: async (data) => {
   connectionManager.publish(`inbox:${data.payload.sender.id}`, JSON.stringify(data));
  },
  [SERVER_EVENTS.RECEIPTS.READ]: async (data) => {
   connectionManager.publish(`inbox:${data.payload.sender.id}`, JSON.stringify(data));
  },
  [SERVER_EVENTS.RECEIPTS.ALL_READ]: async (data) => {
   connectionManager.publish(`inbox:${data.payload.sender.id}`, JSON.stringify(data));
  },
};
