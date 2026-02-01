import { EventEmitter } from "node:events";
export const eventBus = new EventEmitter();

export const DOMAIN_EVENTS = {
  MESSAGES: {
    SENT: "message.sent",
  },
  // Easy to expand later!
  // AUTH: {
  //   LOGOUT: "auth.logout",
  // }
} as const;
