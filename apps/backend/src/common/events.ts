import { EventEmitter } from "node:events";
export const eventBus = new EventEmitter();

// export const DOMAIN_EVENTS = {
//   MESSAGES: {
//     CREATE: "req:message.create",
//     UPDATE: "req:message.update",
//     DELETE: "req:message.delete",
//     SENT: "event:message.sent",
//     CREATED: "event:message.created",
//     UPDATED: "event:message.updated",
//     DELETED: "event:message.deleted",
//   },
//   RECEIPTS: {
//     SENT: "req:receipt.sent",
//     DELIVER: "req:receipt.delive",
//     _READ: "req:receipt.read",
//     FAIL: "req:receipt.fail",
//     ALL_DELIVER: "req:receipts.all.deliver",
//     ALL__READ: "req:receipts.all.read",
//     DELIVERED: "event:receipt.delivered",
//     READ: "event:receipt.read",
//     FAILED: "event:receipt.failed",
//     ALL_DELIVERED: "event:receipts.all.delivered",
//     ALL_READ: "event:receipts.all.read",
//   },
//   USERS: {},
// } as const;
