import { factory } from "src/common/db/drizzle-factory";
import { BlocksController } from "./block.controller";

export const blockedRouter = factory.createApp();

// Core Operations
blockedRouter.post("/", ...BlocksController.block);
blockedRouter.delete("/:blockId", ...BlocksController.unblock);

// blocked user
blockedRouter.get("/:blockId", ...BlocksController.getBlock);

// for admin
blockedRouter.get("/", ...BlocksController.getAllBlocks);

// Users I blocked
blockedRouter.get("/blocker/:blockerId", ...BlocksController.listBlockedUsers);

// Users who blocked me
blockedRouter.get(
  "/blocked/:blockedId",
  ...BlocksController.listWhoBlockedUser,
);

// Unique block
blockedRouter.get(
  "/:blockerId/:blockedId",
  ...BlocksController.getBlockBetween,
);

// Count blocked users
blockedRouter.get(
  "/blocker/:blockerId/block-count",
  ...BlocksController.getBlockCountForUser,
);
