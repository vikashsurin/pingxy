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
    UPDATE: "req:receipt.update",
    UPDATE_ALL: "req:receipts.update.all",
  },
  USERS: {
    LIST: "req:users.list",
    CONNECT: "req:user.connect",
    DISCONNECT: "req:user.disconnect",
    LOGOUT: "req:user.logout",
    LOGIN: "req:user.login",
  },
  PARTICIPANTS: {
    UPDATE: "req:participant.update",
  },
  CONVERSATIONS: {
    OPEN: "req:conversation.open",
  },
  TYPING: {
    START: "req:typing.start",
    STOP: "req:typing.stop",
  },
  PRESENCE: {
    ONLINE: "req:presence.online",
    OFFLINE: "req:presence.offline",
  },
  HEARTBEAT: "req:heartbeat",
  SUBSCRIPTION: {
    PRESENCE: "req:subscription.presence",
  }

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
  PARTICIPANTS: {
    UPDATED: "event:participant.updated",
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
  PRESENCE: {
    ONLINE: "event:presence.online",
    OFFLINE: "event:presence.offline",
  },
  HEARTBEAT: "event:heartbeat",
  SUBSCRIPTION: {
    PRESENCE: 'event:subscription.presence'
  }

} as const;

type ExtractEvents<T> = T extends object
  ? { [K in keyof T]: ExtractEvents<T[K]> }[keyof T]
  : T;

// export type DomainEvent = ExtractEvents<typeof DOMAIN_EVENTS>;
// export type ServerEvent = ExtractEvents<typeof SERVER_EVENTS>;
