import { type BunSQLDatabase } from "drizzle-orm/bun-sql";
import { type PgTransaction } from "drizzle-orm/pg-core";
import db from "../client";
import { conversations, participants, users } from "../schema/index";
import { eq, desc, and, aliasedTable, ne, exists, countDistinct, sql, or, getTableColumns, inArray } from "drizzle-orm";
import { type NewConversation } from "@chat/shared/src/lib/utils/validation";
import { alias } from "drizzle-orm/pg-core";

export const insertConversation = async (
  conversation: NewConversation,
  tx: BunSQLDatabase | PgTransaction<any, any, any> = db
) => {
  return await tx.insert(conversations).values(conversation).returning();
};

export const selectConversationById = async (id: number) => {
  return await db
    .select()
    .from(conversations)
    .where(eq(conversations.conversation_id, id))
    .limit(1);
};

// export const selectConversationsByUserId = async (userId: number) => {
//   return await db
//     .select()
//     .from(participants)
//     .where(eq(participants.user_id, userId))
//     .limit(10);
// };


// Select conversation by 2 distinct Users
export const selectConversationByUsersPrecise = async (userId1: number, userId2: number) => {
  const userIds = [userId1, userId2].sort(); // Sort for consistency

  // Subquery: Find conversation IDs that have both users
  const conversationsWithBothUsers = db
    .select({ conversation_id: participants.conversation_id })
    .from(participants)
    .where(inArray(participants.user_id, userIds))
    .groupBy(participants.conversation_id)
    .having(sql`count(distinct ${participants.user_id}) = 2`)
    .as('matched_conversations');

  // Main query: Get the conversation, but only if it has exactly 2 participants total
  const result = await db
    .select({ conversation: conversations, })
    .from(conversations)
    .innerJoin(
      conversationsWithBothUsers,
      eq(conversations.conversation_id, conversationsWithBothUsers.conversation_id)
    )
    .innerJoin(
      participants,
      eq(participants.conversation_id, conversations.conversation_id)
    )
    .groupBy(conversations.conversation_id, conversations.created_at)
    .having(sql`count(${participants.user_id}) = 2`);

  return result[0] || null;
}

// export const selectConversationsByUserId = async (userId: number) => {
//   // Alias the participants table to join it against itself
//   const otherParticipants = aliasedTable(participants, 'other_participants');

//   const result = await db
//     .select({
//       conversation_id: participants.conversation_id,
//       user: {
//         id: users.id,
//         username: users.username,
//         user_type: users.user_type,
//         data: users.data,
//         last_seen_at: users.last_seen_at
//       }
//     })
//     .from(participants)
//     // 1. Get the other participant in the same conversation
//     .innerJoin(
//       otherParticipants,
//       and(
//         eq(participants.conversation_id, otherParticipants.conversation_id),
//         ne(otherParticipants.user_id, userId) // Exclude the current user
//       )
//     )
//     // 2. Optional: Join users table to get the other participant's details
//     .leftJoin(users, eq(otherParticipants.user_id, users.id))
//     // 3. Filter by the current user's ID
//     .where(eq(participants.user_id, userId))
//     .limit(10);

//   return result;
// };



export const selectConversationsByUserId = async (userId: number) => {
  const p1 = alias(participants, 'p1')
  const p2 = alias(participants, 'p2')

  // Get conversations with all participant details
  const result = await db.select({
    conversation_id: conversations.conversation_id,
    created_at: conversations.created_at,
    user: {
      id: users.id,
      username: users.username,
      user_type: users.user_type,
      data: users.data,
      last_seen_at: users.last_seen_at
    }

  })
    .from(conversations)
    .innerJoin(p1, eq(p1.conversation_id, conversations.conversation_id))
    .innerJoin(p2,
      and(
        eq(p2.conversation_id, conversations.conversation_id),
        ne(p2.user_id, userId),
      )
    )
    .innerJoin(users, eq(users.id, p2.user_id))
    .where(eq(p1.user_id, userId))
    .orderBy(desc(conversations.created_at))
    .limit(10);
  return result;
};

// export const selectExistingDirectConversation = async (
//   userIdA: number,
//   userIdB: number,
//   tx: any = db
// ) => {
//   const [id1, id2] = [userIdA, userIdB].sort((a, b) => a - b); // always smaller first

//   const result = await tx
//     .select()
//     .from(conversations)
//     .innerJoin(
//       participants,
//       eq(conversations.conversation_id, participants.conversation_id)
//     )
//     .where(
//       and(
//         eq(conversations.conversation_type, "direct"),
//         eq(conversations.is_deleted, false),
//         eq(participants.user_id, id1), // smaller id
//       )
//     )
//     .where(
//       exists(
//         tx // or db
//           .select()
//           .from(participants)
//           .where(
//             and(
//               eq(participants.conversation_id, conversations.conversation_id),
//               eq(participants.user_id, id2) // bigger id
//             )
//           )
//       )
//     )
//     .limit(3);

//   return result ?? null;
// };



export const selectExistingDirectConversation = async (
  userIdA: number,
  userIdB: number,
  tx: any = db // Use transaction if provided, else default db
) => {
  // 1. Canonical sorting to ensure id1 < id2 for consistent lookups
  const [id1, id2] = [userIdA, userIdB].sort((a, b) => a - b);

  // 2. Alias the participants table to fetch the second user specifically
  const p2 = alias(participants, "p2");

  const result = await tx
    .select({
      conversation: conversations,
      participant1: participants,
      participant2: p2,
    })
    .from(conversations)
    // Join first participant (id1)
    .innerJoin(
      participants,
      eq(conversations.conversation_id, participants.conversation_id)
    )
    // Join second participant (id2) to ensure both are in the result
    .innerJoin(
      p2,
      eq(conversations.conversation_id, p2.conversation_id)
    )
    .where(
      and(
        eq(conversations.conversation_type, "direct"),
        eq(conversations.is_deleted, false),
        eq(participants.user_id, id1),
        eq(p2.user_id, id2)
      )
    )
    .limit(1); // For direct chats, there should be exactly one or zero

  // Return the first match or null if not found
  return result[0] ?? null;
};



// export const selectConversationByAuthorId = async (authorId: number) => {
//   return await db
//     .select()
//     .from(conversations)
//     .where(eq(conversations.created_by, authorId))
//     .limit(1);
// };

export const deleteConversation = async (id: number) => {
  return await db
    .delete(conversations)
    .where(eq(conversations.conversation_id, id))
    .returning();
};
