import { EventEmitter } from "node:events";
export const eventBus = new EventEmitter();

export const DOMAIN_EVENTS = {
  MESSAGES: {
    CREATED: "message.created",
    SENT: "message.sent",
    UPDATED: "message.updated",
    DELETED: "message.deleted",
  },
  RECEIPTS: {
    SENT: "receipt.sent",
    DELIVERED: "receipt.delivered",
    READ: "receipt.read",
    FAILED: "receipt.failed",
    ALL_DELIVERED: "receipts.all.delivered",
    ALL_READ: "receipts.all.read",
  },
  USERS: {},
} as const;
