import { eventBus } from "@common/events"
import { createServerEvent } from "@common/socket/socket.factory"
import { SERVER_EVENTS } from "@pingxy/shared/constants"
import redis from "@common/redis"


export const UXService = {
  typingStart: async (conversationId: number, userId: number) => {

    const payload = createServerEvent(SERVER_EVENTS.TYPING.STARTED, {
      conversationId,
      userId,
    })

    eventBus.emit(SERVER_EVENTS.TYPING.STARTED, payload)
  },


  presence: async (ofId: number, forId: number, conversationId: number) => {

    const isOnline = await redis.sismember(`online_users`, `${ofId}`)
    console.log("service layer", isOnline)



    const payload = createServerEvent(SERVER_EVENTS.PRESENCE.ONLINE, {
      conversationId,
      of: ofId,
      for: forId,
      online: isOnline,
    })

    eventBus.emit(SERVER_EVENTS.PRESENCE.ONLINE, payload)
  },
}
