import { eventBus } from "@lib/events";
import redis from "@lib/redis";
import { broadcast } from "@lib/socket/pubsub";
// import { getSocket } from "@lib/socket/pubsub";
import { createServerEvent } from "@lib/socket/socket.factory";
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
      userName: body.userName,
      age: body.age,
      gender: body.gender,
      country: body.country,
      bio: body.bio,
    };


    const [user] = await UserService.createUser(newUser);


    const token = crypto.randomUUID();

    await SessionService.createSession(token, user.id, ipAddress, userAgent);
    await redis.hset(`user:${user.id}`, {
      id: user.id,
      type: user.type,
      userName: user.userName,
      age: user.age,
      gender: user.gender,
      country: user.country,
      email: user.email ?? '',
      bio: user.bio ?? '',
      lastSeentAt: user.lastSeenAt?.toISOString() ?? '',
    });
    return {
      user: user,
      token: token,
    };
  },
  login: async ({
    userName,
    password,
    info,
    ipAddress,
    userAgent,
  }: {
    userName: string;
    password: string;
    info: ConnInfo;
    ipAddress: string;
    userAgent: string;
  }) => {

    const { hashedPassword, ...user } =
      await UserService.getAuthUserByUsername(userName);

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
    //
    //  Save to redis
    await redis.hset(`user:${user.id}`, {
      id: user.id,
      type: user.type,
      userName: user.userName,
      age: user.age,
      gender: user.gender,
      country: user.country,
      email: user.email ?? '',
      bio: user.bio ?? '',
      lastSeentAt: user.lastSeenAt?.toISOString() ?? '',
    });
    // TODO set expiry
    // await redis.expire(`user:${user.id}`, 3600)

    const event = createServerEvent(SERVER_EVENTS.USERS.LOGIN, {
      user: { ...user },
    });
    broadcast(SERVER_EVENTS.USERS.LOGIN, event);

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
      userName: body.userName,
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


    // Close the socket

    // Remove user from db, if the user is a guest
    if (user.type === "guest") {
      const removed = UserService.removeUser(user.id);
      if (!removed) {
        throw new Error("Error removing Guest user");
      }
    }
    const event = createServerEvent(SERVER_EVENTS.USERS.LOGOUT, { user });
    broadcast(SERVER_EVENTS.USERS.LOGOUT, event);

    return success;
  },
};
