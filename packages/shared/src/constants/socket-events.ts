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
  USERS: {
    LIST: "req:users.list",
    CONNECT: "req:user.connect",
    DISCONNECT: "req:user.disconnect",
    LOGOUT: "req:user.logout",
    LOGIN: "req:user.login",
  },
  CONVERSATIONS: {
    OPEN: "req:conversation.open",
  },
  TYPING: {
    START: "req:typing.start",
    STOP: "req:typing.stop",
  },

} as const;

export const SERVER_EVENTS = {
  ERRORS: {
    SYSTEM: "event:error.system",
  },
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
  USERS: {
    LIST: "event:users.list",
    CONNECTED: "event:user.connected",
    DISCONNECTED: "event:user.disconnected",
    LOGIN: "event:user.login",
    LOGOUT: "event:user.logout",
  },
  BLOCKS: {
    UNBLOCKED: "event:blocks.unblocked",
  },
  CONVERSATIONS: {
    OPEN: "event:conversation.open",
  },
  TYPING: {
    STARTED: "event:typing.started",
    STOPPED: "event:typing.stopped",
  },

} as const;

type ExtractEvents<T> = T extends object
  ? { [K in keyof T]: ExtractEvents<T[K]> }[keyof T]
  : T;

// export type DomainEvent = ExtractEvents<typeof DOMAIN_EVENTS>;
// export type ServerEvent = ExtractEvents<typeof SERVER_EVENTS>;
