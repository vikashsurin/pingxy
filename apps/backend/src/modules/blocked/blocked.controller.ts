import { factory } from "@common/db/drizzle-factory";
import { validate } from "@common/utils/validator";
import { z } from "zod";
import { BlockedUserService } from "./blocked.service";

export const BlocksController = {
  block: factory.createHandlers(
    validate(
      "json",
      z.object({ blockerId: z.coerce.number(), blockedId: z.coerce.number() }),
    ),
    async (c) => {
      const { blockerId, blockedId } = c.req.valid("json");
      const result = await BlockedUserService.block({ blockerId, blockedId });
      return c.json(result);
    },
  ),
  unblock: factory.createHandlers(
    validate("param", z.object({ blockId: z.coerce.number() })),
    async (c) => {
      const { blockId } = c.req.valid("param");
      const result = await BlockedUserService.unblock({ blockId });
      return c.json(result);
    },
  ),
  getBlock: factory.createHandlers(
    validate("param", z.object({ blockId: z.coerce.number() })),
    async (c) => {
      const { blockId } = c.req.valid("param");
      const result = await BlockedUserService.findById({ blockId });
      return c.json(result);
    },
  ),
  listBlockedUsers: factory.createHandlers(
    validate("param", z.object({ blockerId: z.coerce.number() })),
    async (c) => {
      const { blockerId } = c.req.valid("param");
      const result = await BlockedUserService.listBlocked({ blockerId });
      return c.json(result);
    },
  ),
  listWhoBlockedUser: factory.createHandlers(
    validate("param", z.object({ blockedId: z.coerce.number() })),
    async (c) => {
      const { blockedId } = c.req.valid("param");
      const result = await BlockedUserService.listBlockers({ blockedId });
      return c.json(result);
    },
  ),
  getBlockBetween: factory.createHandlers(
    validate(
      "param",
      z.object({ blockerId: z.coerce.number(), blockedId: z.coerce.number() }),
    ),
    async (c) => {
      const { blockerId, blockedId } = c.req.valid("param");
      const result = await BlockedUserService.find({ blockerId, blockedId });
      return c.json(result);
    },
  ),
  getBlockCountForUser: factory.createHandlers(
    validate("param", z.object({ blockerId: z.coerce.number() })),
    async (c) => {
      const { blockerId } = c.req.valid("param");
      const result = await BlockedUserService.countBlocked({ blockerId });
      return c.json(result);
    },
  ),
  getAllBlocks: factory.createHandlers(async (c) => {
    const result = await BlockedUserService.listAll();
    return c.json(result);
  }),
};
