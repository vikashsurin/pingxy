import { factory } from "@common/db/drizzle-factory";
import { validate } from "@common/utils/validator";
import { ClientPayloadSchema } from "@pingxy/shared/domain/message";
import { MessageService } from "./message.service";

export const MessageController = {

  create: factory.createHandlers(
    validate("json", ClientPayloadSchema),
    async (c) => {

      const body = c.req.valid('json')

      const result = await MessageService.sendMessage(body)

      return c.json({ result });
    }),
};
