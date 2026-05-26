import db, { DB_TX } from "@lib/db/client"
import {
  verificationTokens
} from "@pingxy/shared/domain"
import { eq } from "drizzle-orm"

export const VerificationTokenRepository = {
  insert: async (data: any, tx: DB_TX = db) => {
    const row = await
      tx
        .insert(verificationTokens)
        .values(data)
        .returning()
    return row[0]
  },

  selectById: async ({ id, tx = db }: { id: number, tx: DB_TX }) => {
    const row = await
      tx
        .select()
        .from(verificationTokens)
        .where(
          eq(
            verificationTokens.id, id
          )
        )
    return row[0]
  },

  selectByTokenHash: async ({ tokenHash, tx = db }: { tokenHash: string, tx?: DB_TX }) => {
    const row = await
      tx
        .select()
        .from(verificationTokens)
        .where(
          eq(
            verificationTokens.tokenHash, tokenHash
          )
        )
    return row[0]
  },

  update: async ({ id, data, tx = db }: { id: number, data: any, tx: DB_TX }) => {
    const row = await
      tx
        .update(verificationTokens)
        .set(data)
        .where(
          eq(
            verificationTokens.id, id
          )
        )
    return row[0]
  },

  delete: async ({ id, tx = db }: { id: number, tx: DB_TX }) => {
    const row = await
      tx
        .delete(verificationTokens)
        .where(
          eq(
            verificationTokens.id, id
          )
        )
    return row[0]
  },

}
