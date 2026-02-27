import { SERVER_EVENTS } from "@pingxy/shared/constants";
import { BusListener } from "./index";
import { publish } from "../pubsub";

export const receiptListener: BusListener = {
  [SERVER_EVENTS.RECEIPTS.DELIVERED]: async (data) => {
    publish(`inbox:${data.payload.recipient.id}`, JSON.stringify(data));
  },
  [SERVER_EVENTS.RECEIPTS.READ]: async (data) => {
    publish(`inbox:${data.payload.recipient.id}`, JSON.stringify(data));
  },
  [SERVER_EVENTS.RECEIPTS.ALL_READ]: async (data) => {
    // publish(`inbox:${data.payload.recipient.id}`, JSON.stringify(data));

    console.log("emitting event :: ", data)
    // Inform the user that all receipts have been read
    // So the user can update their UI accordingly -> set unreadCount to 0
    publish(`inbox:${data.payload.userId}`, JSON.stringify(data));
  },
};
