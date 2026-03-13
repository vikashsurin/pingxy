import { eventBus } from "@common/events";
import { createServerEvent } from "@common/socket/socket.factory";
import { SessionService } from "@modules/sessions";
import { UserService } from "@modules/users";
import { SERVER_EVENTS } from "@pingxy/shared/constants";
import {
  NewUser,
  RegisterGuest,
  RegisterUser,
} from "@pingxy/shared/domain/user";
import { ConnInfo } from "hono/conninfo";
import { HTTPException } from "hono/http-exception";

export const AuthService = {
  register: async ({
    body,
    info,
    ipAddress,
    userAgent,
  }: {
    body: RegisterUser;
    info: ConnInfo;
    ipAddress: string;
    userAgent: string;
  }) => {
    const hashedPassword = await Bun.password.hash(body.password);

    const newUser = {
      type: "user" as const,
      hashedPassword: hashedPassword,
      username: body.username,
      age: body.age,
      gender: body.gender,
      country: body.country,
      bio: body.bio,
    };


    const [user] = await UserService.createUser(newUser);


    const token = crypto.randomUUID();
    await SessionService.createSession(token, user.id, ipAddress, userAgent);

    return {
      user: user,
      token: token,
    };
  },
  login: async ({
    username,
    password,
    info,
    ipAddress,
    userAgent,
  }: {
    username: string;
    password: string;
    info: ConnInfo;
    ipAddress: string;
    userAgent: string;
  }) => {
    const { hashedPassword, ...user } =
      await UserService.getAuthUserByUsername(username);

    if (!user) {
      throw new HTTPException(401, { message: "Invalid credentials" });
    }

    const valid = await Bun.password.verify(password, hashedPassword ?? "");

    if (!valid) {
      throw new HTTPException(401, { message: "Invalid credentials" });
    }

    const token = crypto.randomUUID();

    await SessionService.createSession(token, user.id, ipAddress, userAgent);

    // Emit USER LOGIN EVENT
    // const validatedData = UserMetaDataSchema.parse(user.data);

    const event = createServerEvent(SERVER_EVENTS.USERS.LOGIN, {
      user: { ...user },
    });
    eventBus.emit(SERVER_EVENTS.USERS.LOGIN, event);

    return {
      user: user,
      token: token,
    };
  },

  guest: async ({
    body,
    info,
    ipAddress,
    userAgent,
  }: {
    body: RegisterGuest;
    info: ConnInfo;
    ipAddress: string;
    userAgent: string;
  }) => {
    const newUser: NewUser = {
      username: body.username,
      type: "guest" as const,
      age: body.age,
      gender: body.gender,
      country: body.country,
      bio: body.bio,
    };
    const [user] = await UserService.createUser(newUser);

    const token = crypto.randomUUID();
    await SessionService.createSession(token, user.id, ipAddress, userAgent);

    return {
      user: null,
      token: token,
    };
  },

  logout: async (cookie: string) => {
    const user = await SessionService.getSessionUser(cookie);
    const success = await SessionService.revokeSession(cookie);
    if (!success) {
      throw new Error("Failed to Logout user");
    }

    // Remove user from db, if the user is a guest
    if (user.type === "guest") {
      const removed = UserService.removeUser(user.id);
      if (!removed) {
        throw new Error("Error removing Guest user");
      }
    }
    const event = createServerEvent(SERVER_EVENTS.USERS.LOGOUT, { user });
    eventBus.emit(SERVER_EVENTS.USERS.LOGOUT, event);

    return success;
  },
};
