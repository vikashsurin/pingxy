import { UUID } from "crypto";

export type Message = {
  type: "join" | "message";
  message?: string;
  channel?: string;
  socketId?: number;
};

export type Room = {
  name: string;
  id: number;
};

export type Topic = {
  name: string;
  id: UUID;
  admin?: number;
};

export type Client = {
  socketID: UUID;
  name: string;
};
