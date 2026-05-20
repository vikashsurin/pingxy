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

export const EmailSchema = z.email();

const BaseUserSchema = z.object({
  email: z.email("Invalid email address"),
  password: z
    .string()
    .min(
      MIN_PASSWORD_LENGTH,
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
    )
    .max(
      MAX_PASSWORD_LENGTH,
      `Password must be at most ${MAX_PASSWORD_LENGTH} characters`,
    ),
});

export const RegisterUserRequestSchema = BaseUserSchema.extend({
  userName: z
    .string()
    .min(MIN_NAME_LENGTH, `Name must be at least ${MIN_NAME_LENGTH} characters`)
    .max(MAX_NAME_LENGTH, `Name must be at most ${MAX_NAME_LENGTH} characters`),
  confirmPassword: z.string(),
}).refine((values) => values.password === values.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Remove GuestUserRequestSchema permanently and use RegisterUserRequestSchema for both guest and regular users. --- IGNORE ---
export const GuestUserRequestSchema = BaseUserSchema;

export const selectUserSchema = createSelectSchema(users)
  .omit({
    hashedPassword: true,
    email: true,
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
