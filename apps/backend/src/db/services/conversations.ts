import {
  Conversation,
  conversationInsertSchema,
  Message,
  NewConversation,
  NewMessage,
  NewParticipant,
  Participant,
} from "@chat/shared/src/lib/utils/validation";

import * as queries from "../queries/index";
import db from '../client';

export const createConversation = async (conversation: NewConversation) => {
  try {
    return await queries.insertConversation(conversation);

  } catch (error) {
    console.error("Error creating conversation:", error);
    throw new Error("Ersror creating conversation");
  }
};

export const conversationExists = () => { }

export const findConversation = async (participantIds: number[]) => {
  // try {
  //   return await queries.selectConversationByParticipantIds(participantIds);
  // } catch (error) {
  //   console.error("Error finding conversation:", error);
  //   throw new Error("Error finding conversation");
  // }
}

export const findConversationByUser = async ({ userId1, userId2 }: { userId1: number, userId2: number }) => {
  try {
    return await queries.selectConversationByUsersPrecise(userId1, userId2);
  } catch (error) {
    console.error("Error finding conversation by user ids:", error);
    throw new Error("Error finding conversation by user ids");
  }
}



export const findOrCreateConversationByUser = async ({ userId1, userId2 }: { userId1: number, userId2: number }) => {
  try {
    const result = await findConversationByUser({ userId1, userId2 });

    if (result) {
      return result.conversation
    }

    const [conversation] = await createConversation({
      conversation_type: 'direct',
      created_at: new Date(Date.now()),
      updated_at: new Date(Date.now())
    })

    return conversation

  } catch (error) {
    console.error("Error finding or creating conversation", error);
    throw new Error("Internal Server Error");
  }
}

export const findConversationByParticipant = async (participantIds: number[]) => {
  // try {
  //   return await queries.selectConversationByParticipantIds(participantIds);
  // } catch (error) {
  //   console.error("Error finding conversation by participant ids:", error);
  //   throw new Error("Error finding conversation by participant ids");
  // }
}


export const findOrCreateConversation = async (participantIds: number[]) => {
  // try {
  //   return await queries.selectConversationByParticipantIds(participantIds);
  // } catch (error) {
  //   console.error("Error finding conversation by participant ids:", error);
  //   throw new Error("Error finding conversation by participant ids");
  // }
}


export const getConversation = async (conversation_id: number) => {
  try {
    return await queries.selectConversationById(conversation_id);
  } catch (error) {
    console.error("Error getting conversation by id:", error);
    throw new Error("Error getting conversation by id");
  }
};

export const getConversationsByUser = async (user_id: number) => {
  try {
    return await queries.selectConversationsByUserId(user_id);
  } catch (error) {
    console.error("Error getting conversations by user id:", error);
    throw new Error("Error getting conversations by user id");
  }
};

export const removeConversation = async (conversation_id: number) => {
  try {
    return await queries.deleteConversation(conversation_id);
  } catch (error) {
    console.error("Error removing conversation:", error);
    throw new Error("Error removing conversation");
  }
};

// // Queries
// export const conversationExists = (participantIds) => { /* ... */ }
// export const findConversation = (participantIds) => { /* ... */ }
// export const getConversation = (id) => { /* ... */ }
// export const getConversationsByUser = (userId) => { /* ... */ }

// // Actions
// export const createConversation = (participantIds) => { /* ... */ }
// export const deleteConversation = (id) => { /* ... */ }

// // Combined
// export const findOrCreateConversation = (participantIds) => { /* ... */ }







// export const createNewConversation = async ({
//   isNew,
//   recipient_id,
//   message,
// }: {
//   isNew: Boolean;
//   recipient_id: number;
//   message: NewMessage;
// }) => {
//   // Use 'return' here so the outer function returns the transaction result


//   let conversation: any;
//   let participant1: any;
//   let participant2: any;
//   return await db.transaction(async (tx) => {
//     // 1. Check if direct conversation already exists
//     const existing = await queries.selectExistingDirectConversation(
//       recipient_id,
//       message.sender_id,
//       tx
//     );

//     // if (existing) {
//     //   return {
//     //     conversation: existing.conversation,
//     //     participant1: existing.participant1,
//     //     participant2: existing.participant2,
//     //     isNew: false
//     //   };
//     // }
//     conversation = existing.conversation
//     if (!existing) {
//       const newConversation: NewConversation = {
//         conversation_type: 'direct',
//         created_at: Math.floor(Date.now()),
//         updated_at: Math.floor(Date.now())
//       }

//       // 2. Create the conversation
//       const [conv] = await queries.insertConversation(
//         newConversation,
//         tx
//       );
//       if (!conv) throw new Error("Error creating New Conversation");

//       conversation = conv

//       // 3. Prepare participant data
//       const participantsToInsert = [
//         {
//           conversation_id: conversation.conversation_id,
//           user_id: message.sender_id,
//           role: "member" as const,
//         },
//         {
//           conversation_id: conversation.conversation_id,
//           user_id: recipient_id,
//           role: "member" as const,
//         },
//       ];

//       // 4. Insert Participants (Looping or Promise.all is cleaner)
//       const participants = [];
//       for (const p of participantsToInsert) {
//         const [inserted] = await queries.insertParticipant(p, tx);
//         if (!inserted)
//           throw new Error(`Error inserting participant ${p.user_id}`);
//         participants.push(inserted);
//       }
//       participant1 = participants[0]
//       participant2 = participants[1]
//     }
//     // 5. Insert NewMessage
//     const [msg] = await queries.insertMessage({ message, tx })

//     return {
//       conversation,
//       message: msg,
//       participant1,
//       participant2,
//       isNew: true,
//     };
//   });
// };
