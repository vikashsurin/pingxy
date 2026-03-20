import { factory } from "@lib/db/drizzle-factory";
import { authMiddleware } from "@lib/middlewares/auth";
import { ReceiptController } from "./receipt.controller";

export const receiptRouter = factory.createApp();

receiptRouter.use(authMiddleware);
receiptRouter.patch('/:id', ...ReceiptController.updateReceipt);
receiptRouter.patch("/read", ...ReceiptController.updateAllReceipt)
