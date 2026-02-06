export const DOMAIN_EVENTS = {
  MESSAGES: {
    SENT: "req:message.sent",
    CREATE: "req:message.create",
    UPDATE: "req:message.update",
    DELETE: "req:message.delete",
  },
  RECEIPTS: {
    SENT: "req:receipt.sent",
    DELIVER: "req:receipt.deliver",
    READ: "req:receipt.read",
    FAIL: "req:receipt.fail",
    ALL_DELIVER: "req:receipts.all.deliver",
    ALL_READ: "req:receipts.all.read",
  },
  USERS: {},
} as const;

export const SERVER_EVENTS = {
  MESSAGES: {
    SENT: "event:message.sent",
    CREATED: "event:message.created",
    UPDATED: "event:message.updated",
    DELETED: "event:message.deleted",
  },
  RECEIPTS: {
    SENT: "event:receipt.sent",
    DELIVERED: "event:receipt.delivered",
    READ: "event:receipt.read",
    FAILED: "event:receipt.failed",
    ALL_DELIVERED: "event:receipts.all.delivered",
    ALL_READ: "event:receipts.all.read",
  },
} as const;

type ExtractEvents<T> = T extends object
  ? { [K in keyof T]: ExtractEvents<T[K]> }[keyof T]
  : T;

export type DomainEvent = ExtractEvents<typeof DOMAIN_EVENTS>;
export type ServerEvent = ExtractEvents<typeof SERVER_EVENTS>;
