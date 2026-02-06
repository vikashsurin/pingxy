import { factory } from "@common/db/drizzle-factory";
import { validate } from "@common/utils/validator";
import { ClientReqSchema } from "@pingxy/shared/socket/schema";

import { MessageService } from "./message.service";

export const MessageController = {
  create: factory.createHandlers(
    validate("json", ClientReqSchema),
    async (c) => {
      const body = c.req.valid("json");

      const result = await MessageService.sendMessage(body);

      return c.json({ result });
    },
  ),
};
