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

export const insertUserSchema = createInsertSchema(users);
// export const selectUserSchema = createSelectSchema(users);

export const UserMetaDataSchema = z.object({
  gender: z.string(),
  age: z.number().min(18, "Age must be a positive number"),
  country: z.string(),
  roles: z.array(z.string()).optional(),
  bio: z.string().optional(),
});

const BaseUserSchema = z.object({
  username: z
    .string()
    .min(MIN_NAME_LENGTH, "Username must be at least 3 characters")
    .max(MAX_NAME_LENGTH, "Username must be at most 16 characters"),
  data: UserMetaDataSchema,
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
  })
  .extend({
    data: UserMetaDataSchema,
    lastSeenAt: z.coerce.date().nullable(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
  });

// export const UserUpdateSchema = createUpdateSchema(users);

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
