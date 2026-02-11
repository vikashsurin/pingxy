import { factory } from "src/common/db/drizzle-factory";
import { BlocksController } from "./block.controller";

export const blockedRouter = factory.createApp();

// 1. Static/Specific Routes First
blockedRouter.get(
  "/blocker/:blockerId/with-info",
  ...BlocksController.listBlockedUsersWithInfo,
);
blockedRouter.get(
  "/blocker/:blockerId/block-count",
  ...BlocksController.getBlockCountForUser,
);
blockedRouter.get("/blocker/:blockerId", ...BlocksController.listBlockedUsers);

// 2. Specific "Reverse" lookup
blockedRouter.get(
  "/blocked/:blockedId",
  ...BlocksController.listWhoBlockedUser,
);

// 3. Multi-parameter route (placed before single param)
blockedRouter.get(
  "/:blockerId/:blockedId",
  ...BlocksController.getBlockBetween,
);

// 4. Generic ID Routes Last (The "Catch-alls")
blockedRouter.get("/:blockId", ...BlocksController.getBlock);

// 5. Root/Admin
blockedRouter.get("/", ...BlocksController.getAllBlocks);
blockedRouter.post("/", ...BlocksController.block);
blockedRouter.delete("/:blockId", ...BlocksController.unblock);
