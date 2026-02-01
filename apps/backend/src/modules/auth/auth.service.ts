import { NewUser, RegisterGuest, RegisterUser } from "@pingxy/shared/domain/user";
import { SessionService } from "@modules/sessions";
import { UserService } from "@modules/users";
import { ConnInfo } from "hono/conninfo";
import { HTTPException } from "hono/http-exception";


export const AuthService = {

  register: async ({
    body,
    info,
    ip_address,
    userAgent
  }: {
    body: RegisterUser,
    info: ConnInfo,
    ip_address: string,
    userAgent: string
  }) => {

    const hashed_password = await Bun.password.hash(body.password);

    const newUser: NewUser = {
      username: body.username,
      user_type: 'user' as const,
      hashed_password: hashed_password,
      data: body.data,
    }

    const [user] = await UserService.createUser(newUser)

    const token = crypto.randomUUID()
    await SessionService.createSession(
      token,
      user.id,
      ip_address,
      userAgent
    )

    return {
      user: user,
      token: token
    }
  },
  login: async ({
    username,
    password,
    info,
    ip_address,
    userAgent
  }: {
    username: string,
    password: string,
    info: ConnInfo,
    ip_address: string,
    userAgent: string
  }) => {
    const { hashed_password, ...user } = await UserService.getAuthUserByUsername(username)

    if (!user) {
      throw new HTTPException(401, { message: "Invalid credentials" })
    }

    const valid = await Bun.password.verify(password, hashed_password ?? '')

    if (!valid) {
      throw new HTTPException(401, { message: "Invalid credentials" })
    }

    const token = crypto.randomUUID()

    await SessionService.createSession(token, user.id, ip_address, userAgent)

    return {
      user: user,
      token: token
    }
  },

  guest: async ({
    body,
    info,
    ip_address,
    userAgent
  }: {
    body: RegisterGuest,
    info: ConnInfo,
    ip_address: string,
    userAgent: string
  }) => {

    const newUser: NewUser = {
      username: body.username,
      user_type: 'guest' as const,
      data: body.data,
    }
    const [user] = await UserService.createUser(newUser)

    const token = crypto.randomUUID()
    await SessionService.createSession(
      token,
      user.id,
      ip_address,
      userAgent
    )

    return {
      user: null,
      token: token
    }
  }

}
