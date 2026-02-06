import type {
  ClientMessageType,
  InsertMessageType,
  SelectMessageType,
} from "../domain/message/message.types";
import type {
  ClientMessageReceiptType,
  MessageReceipt,
} from "../domain/message-receipt/message-receipt.types";

// export type message = {
//   "message.created": {
//     id: string;
//     type: "message.created";
//     payload: {
//       message: InsertMessageType;
//       receipt: ClientMessageReceiptType;
//       conversationId: number;
//       recipient: { id: number; username: string };
//     };
//   };
//   "message.sent": {
//     id: string;
//     type: "message.sent";
//     payload: {
//       message: SelectMessageType;
//       receipt: MessageReceipt;
//       conversationId: number;
//       recipient: { id: number; username: string };
//     };
//   };
// };

export interface SocketEventMap {
  "message.created": {
    id: string;
    type: "message.created";
    payload: {
      message: InsertMessageType;
      receipt: ClientMessageReceiptType;
      conversationId: number;
      recipient: { id: number; username: string };
    };
  };
  "message.sent": {
    id: string;
    type: "message.sent";
    payload: {
      message: SelectMessageType;
      receipt: MessageReceipt;
      conversationId: number;
      recipient: { id: number; username: string };
    };
  };
  "message.updated": {
    id: string;
    type: "message.updated";
    payload: {
      message: ClientMessageType;
      conversationId: number;
      recipient: { id: number; username: string };
    };
  };
  "message.deleted": {
    id: string;
    type: "message.deleted";
    payload: {
      message: ClientMessageType;
      conversationId: number;
      recipient: { id: number; username: string };
    };
  };
  "receipt.sent": {
    id: string;
    type: "receipt.sent";
    payload: {
      receipt: {
        conversationId: number;
        messageId: number;
        userId: number;
        recipient: {
          id: number;
        };
      };
    };
  };
  "receipt.delivered": {
    id: string;
    type: "receipt.delivered";
    payload: {
      receipt: {
        conversationId: number;
        messageId: number;
        userId: number;
        recipient: {
          id: number;
        };
      };
    };
  };
  "receipt.read": {
    id: string;
    type: "receipt.delivered";
    payload: {
      receipt: {
        conversationId: number;
        messageId: number;
        userId: number;
        recipient: {
          id: number;
        };
      };
    };
  };
  "receipt.failed": {
    id: string;
    type: "receipt.failed";
    payload: {
      receipt: {
        conversationId: number;
        messageId: number;
        userId: number;
        recipient: {
          id: number;
        };
      };
    };
  };
  "receipts.all.delivered": {
    id: string;
    type: "receipt.all.delivered";
    payload: {
      receipt: {
        conversationId: number;
        messageId: number;
        userId: number;
        recipient: {
          id: number;
        };
      };
    };
  };
  "receipts.all.read": {
    id: string;
    type: "receipt.all.read";
    payload: {
      receipt: {
        conversationId: number;
        messageId: number;
        userId: number;
        recipient: {
          id: number;
        };
      };
    };
  };
}
