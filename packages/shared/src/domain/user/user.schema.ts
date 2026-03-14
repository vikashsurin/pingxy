import { getTableColumns } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { DOMAIN_EVENTS, SERVER_EVENTS } from "../../constants/index";
import {
  MAX_NAME_LENGTH,
  MAX_PASSWORD_LENGTH,
  MIN_NAME_LENGTH,
  MIN_PASSWORD_LENGTH,
} from "../../constants/user";
import { users } from "./user.table";

const allColumns = getTableColumns(users);
const { hashedPassword, ...publicColumns } = allColumns;
export const publicUserColumns = publicColumns;

export const insertUserSchema = createInsertSchema(users);

const BaseUserSchema = z.object({
  username: z
    .string()
    .min(MIN_NAME_LENGTH, "Username must be at least 3 characters")
    .max(MAX_NAME_LENGTH, "Username must be at most 16 characters"),
  gender: z.enum(["male", "female", "other"]),
  age: z.number().min(18, "Age must be a positive number"),
  country: z.string(),
  bio: z.string().optional(),
});

export const RegisterUserRequestSchema = BaseUserSchema.extend({
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, "Password must be at least 8 characters")
    .max(MAX_PASSWORD_LENGTH, "Password must be at most 32 characters"),
  confirmPassword: z.string(),
}).refine((values) => values.password === values.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const GuestUserRequestSchema = BaseUserSchema;

export const selectUserSchema = createSelectSchema(users)
  .omit({
    hashedPassword: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    lastSeenAt: z.coerce.date().nullable(),
    isOnline: z.boolean().optional(),
  });

export const usersList = z.object({
  id: z.uuid(),
  type: z.literal(SERVER_EVENTS.USERS.LIST),
  payload: z.object({
    users: z.array(selectUserSchema),
  }),
});

// combine similar schemas
export const userConnectSchema = z.object({
  id: z.uuid(),
  type: z.literal(DOMAIN_EVENTS.USERS.CONNECT),
  payload: z.object({
    user: selectUserSchema,
  }),
});

export const userLogoutSchema = z.object({
  id: z.uuid(),
  type: z.literal(DOMAIN_EVENTS.USERS.LOGOUT),
  payload: z.object({
    user: selectUserSchema,
  }),
});

export const userDisconnectSchema = z.object({
  id: z.uuid(),
  type: z.literal(DOMAIN_EVENTS.USERS.DISCONNECT),
  payload: z.object({
    user: selectUserSchema,
  }),
});
export const userConnectedSchema = z.object({
  id: z.uuid(),
  type: z.literal(SERVER_EVENTS.USERS.CONNECTED),
  payload: z.object({
    user: selectUserSchema,
  }),
});

export const userDisconnectedSchema = z.object({
  id: z.uuid(),
  type: z.literal(SERVER_EVENTS.USERS.DISCONNECTED),
  payload: z.object({
    user: selectUserSchema,
  }),
});

export const userLoggedInSchema = z.object({
  id: z.uuid(),
  type: z.literal(SERVER_EVENTS.USERS.LOGIN),
  payload: z.object({
    user: selectUserSchema,
  }),
});

export const userLoggedOutSchema = z.object({
  id: z.uuid(),
  type: z.literal(SERVER_EVENTS.USERS.LOGOUT),
  payload: z.object({
    user: selectUserSchema,
  }),
});
