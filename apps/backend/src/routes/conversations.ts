import { NewConversation, NewParticipant, SocketMessage } from "@chat/shared/src/lib/utils/validation";
import { factory } from "../db/factory";
import { createNewConversation } from "../db";
import { getServer, publish } from "../pubsub";
import { timestamp } from "drizzle-orm/singlestore-core";
const app = factory.createApp()


app.post('/', async (c) => {
  const body = await c.req.json()

  const { created_by, conversation_type, name, participant_id } = body

  console.log('conversations:: ', created_by, conversation_type, name, participant_id)

  const newConversation: NewConversation = {
    name,
    conversation_type,
    created_by,
  }

  const server = getServer()

  const result = await createNewConversation(
    newConversation,
    participant_id,
    created_by)

  const participantIds = [result.participant1.user_id, result.participant2.user_id]

  participantIds.forEach((pid: number) => {
    const newMessage: SocketMessage = {
      type: 'new_conversation',
      id: crypto.randomUUID(),
      conversationId: result.conversation.conversation_id,
      timestamp: new Date().toISOString(),
      data: participantIds,
    }
    publish(`inbox:${pid}`, JSON.stringify(newMessage))
  })

  console.log({ result })

  return c.json({
    conversation_id: result.conversation.conversation_id
  }, 200)
})


export default app;
