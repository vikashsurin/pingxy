export class ChatEntry {
  // Static data: IDs and content are marked as raw to optimize memory
  readonly messageId: number = $state.raw(0);
  readonly conversationId: number = $state.raw(0);

  // The 'message' object contains static fields (text, createdAt, etc.)
  // We keep it in $state.raw because message content is usually immutable
  message = $state.raw<any>({});

  // The 'receipt' object is reactive because 'status' and 'readAt' change
  receipt = $state<any>({});

  constructor(data: { message: any; receipt: any }) {
    this.messageId = data.message.messageId;
    this.conversationId = data.message.conversationId;

    // Assigning the data
    this.message = data.message;
    this.receipt = data.receipt;
  }

  // Helper getters for clean UI code
  get status() {
    return this.receipt?.status ?? 'sent';
  }

  get isMe() {
    // Assuming your senderId logic; replace '2' with your actual 'myId' variable
    return this.message.senderId === 2;
  }
}
