
import { conversationInvites } from "./conversation-invite.table";

import { createInsertSchema, createSelectSchema } from "drizzle-zod";


export const InviteInserSchema = createInsertSchema(conversationInvites);
export const InviteSelectSchema = createSelectSchema(conversationInvites);
