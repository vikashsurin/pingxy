// import type { Message } from "@pingxy/shared";
// import { chatStore } from "./store.svelte";

// export class ChatEntry {
//   readonly messageId: number = $state.raw(0);

//   // Change this from .raw to $state if you ever want to
//   // edit message text or status later
//   message = $state<Message>({} as Message);

//   // This is already correct for deep reactivity
//   receipt = $state<any>({});

//   constructor(data: { message: any; receipt: any }) {
//     this.messageId = data.message.messageId;
//     this.message = data.message;
//     this.receipt = data.receipt;
//   }

//   get status() {
//     return this.receipt?.status ?? "sent";
//   }

//   get isMe() {
//     return this.message.senderId === chatStore.currentUser?.id;
//   }
// }
