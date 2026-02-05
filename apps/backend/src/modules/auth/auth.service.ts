import {
  NewUser,
  RegisterGuest,
  RegisterUser,
} from "@pingxy/shared/domain/user";
import { SessionService } from "@modules/sessions";
import { UserService } from "@modules/users";
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

    const newUser: NewUser = {
      username: body.username,
      userType: "user" as const,
      hashedPassword: hashedPassword,
      data: body.data,
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
      userType: "guest" as const,
      data: body.data,
    };
    const [user] = await UserService.createUser(newUser);

    const token = crypto.randomUUID();
    await SessionService.createSession(token, user.id, ipAddress, userAgent);

    return {
      user: null,
      token: token,
    };
  },
};
