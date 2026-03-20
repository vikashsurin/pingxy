import { factory } from "@lib/db/drizzle-factory";
import { validate } from "@lib/utils/validator";
import { updateAllReceiptReqSchema, updateReceiptReqSchema } from "@pingxy/shared/domain";
import { ReceiptService } from "./receipt.service";

function createReceiptController() {

  const updateReceipt = factory.createHandlers(
    validate('json', updateReceiptReqSchema),
    async (c) => {

      const user = c.get("user")
      const data = c.req.valid('json')

      console.log("data from markDelivered", data)
      const receipt = await ReceiptService.processReceipt(data, user)
      return c.json({})
    })

  const updateAllReceipt = factory.createHandlers(
    validate('json', updateAllReceiptReqSchema),
    async (c) => {

      const user = c.get("user")
      const data = c.req.valid('json')

      console.log("data from updateAllReceipt", data)
      const receipts = await ReceiptService.processAllReceipt(data, user)
      return c.json({})
    })




  const markRead = factory.createHandlers(async (c) => {

  })

  const markAllRead = factory.createHandlers(async (c) => {

  })

  return {
    markRead,
    markAllRead,
    updateReceipt,
    updateAllReceipt,
  }
}


export const ReceiptController = createReceiptController();
