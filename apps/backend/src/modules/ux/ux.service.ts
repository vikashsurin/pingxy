import { eventBus } from "@common/events"
import { createServerEvent } from "@common/socket/socket.factory"
import { SERVER_EVENTS } from "@pingxy/shared/constants"

export const UXService = {
  typingStart: async (conversationId: number, userId: number) => {

    const payload = createServerEvent(SERVER_EVENTS.TYPING.STARTED, {
      conversationId,
      userId,
    })

    eventBus.emit(SERVER_EVENTS.TYPING.STARTED, payload)
  }
}
