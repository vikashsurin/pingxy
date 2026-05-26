import * as t from "drizzle-orm/pg-core";
import { pgTable as table } from "drizzle-orm/pg-core";
import { users } from '../user/user.table';

export const verificationTokenEnum = t.pgEnum('verificationType',
  ["emailVerification",
    "phoneVerification",
    'passwordReset'
  ] as const);

export const verificationTokens = table(
  "verification_tokens",
  {
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: t
      .integer()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: t.text().notNull(),
    type: verificationTokenEnum().notNull(),
    expiresAt: t.timestamp({ withTimezone: true }).notNull(),
    createdAt: t
      .timestamp({ withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    t.index('verification_token_user_id_idx').on(table.userId),
    t.index('verification_token_token_hash_idx').on(table.tokenHash),
  ]
);
