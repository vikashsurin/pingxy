import {
  refreshTokenInsertSchema,
  refreshTokenSelectSchema,
} from "./refresh-token.schema";
import { z } from "zod";

export type RefreshToken = z.infer<typeof refreshTokenSelectSchema>;
export type RefreshTokenInsert = z.infer<typeof refreshTokenInsertSchema>;
