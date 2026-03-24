import { eventBus } from "@lib/events"
import { createServerEvent } from "@lib/socket/socket.factory"
import { SERVER_EVENTS } from "@pingxy/shared/constants"
import redis from "@lib/redis"
import { broadcast } from "@lib/socket/pubsub"


export const UXService = {

  heartbeat: async (userId: number) => {

    const payload = createServerEvent(SERVER_EVENTS.HEARTBEAT, {
      userId,
      pong: true,
    })

    broadcast(SERVER_EVENTS.HEARTBEAT, payload)
  },

  typingStart: async (conversationId: number, userId: number) => {

    const payload = createServerEvent(SERVER_EVENTS.TYPING.STARTED, {
      conversationId,
      userId,
    })

    broadcast(SERVER_EVENTS.TYPING.STARTED, payload)
  },


  presence: async (ofId: number, forId: number, conversationId: number) => {

    const isOnline = await redis.sismember(`online_users`, `${ofId}`)



    const payload = createServerEvent(SERVER_EVENTS.PRESENCE.ONLINE, {
      conversationId,
      of: ofId,
      for: forId,
      online: isOnline,
    })

    broadcast(SERVER_EVENTS.PRESENCE.ONLINE, payload)
  },
}
