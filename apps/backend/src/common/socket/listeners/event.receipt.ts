import { SERVER_EVENTS } from "@pingxy/shared/constants";
import { BusListener } from "./index";
import { publish } from "../pubsub";

export const receiptListener: BusListener = {
  [SERVER_EVENTS.RECEIPTS.DELIVERED]: async (data) => {
    publish(`inbox:${data.payload.sender.id}`, JSON.stringify(data));
  },
  [SERVER_EVENTS.RECEIPTS.READ]: async (data) => {
    publish(`inbox:${data.payload.sender.id}`, JSON.stringify(data));
  },
  [SERVER_EVENTS.RECEIPTS.ALL_READ]: async (data) => {
    publish(`inbox:${data.payload.sender.id}`, JSON.stringify(data));
  },
};
