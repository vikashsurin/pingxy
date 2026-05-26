import { Email, NewUser } from "@pingxy/shared/domain/user";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { UserRepository } from "./user.repository";

export const UserService = {
  createUser: async (newUser: NewUser) => {
    try {
      const email = newUser.email;
      const parsedEmail = z.email().safeParse(email);

      if (!parsedEmail.success) {
        throw new Error("Invalid email");
      }

      const existingUser = await UserRepository.selectByEmail(
        parsedEmail.data,
      );

      if (existingUser) {
        throw new Error("User already exists");
      }
      return UserRepository.insert(newUser);
    } catch (error) {
      console.error("error creating user:", error);
      throw new Error("error creating user");
    }
  },

  getUserByUsername: async (userName: string) => {
    try {
      return await UserRepository.selectByUsername(userName);
    } catch (error) {
      throw new HTTPException(404, { message: "User not found" });
    }
  },


  getUserByEmail: async (email: Email) => {
    try {
      const user = await UserRepository.selectByEmail(email);
      const { hashedPassword, ...safeUser } = user;
      return safeUser;
    } catch (error) {
      throw new HTTPException(404, { message: "User not found" });
    }
  },

  getAuthUserByEmail: async (email: Email) => {
    try {
      const result = await UserRepository.selectByEmail(email);

      if (!result) {
        throw new Error("User not found");
      }
      return result;
    } catch (error) {
      console.error(error);
      throw new Error("Error getting user by email");
    }
  },

  updatePassword: async (
    userId: number,
    currentPassword: string,
    newPassword: string,
  ) => {
    try {
      const [user] = await UserRepository.selectForAuth(userId)

      if (!user) {
        throw new Error("User not found");
      }

      const { hashedPassword } = user

      const isMatch = await Bun.password.verify(currentPassword,
        hashedPassword)

      if (!isMatch) {
        throw new Error("Invalid password");
      }

      const hashedNewPassword = await Bun.password.hash(newPassword)

      const [updatedUser] = await UserRepository.updatePassword(userId, hashedNewPassword)

      return updatedUser;
    } catch (error) {
      console.error(error);
      throw new Error("Error updating password");
    }
  },



  // deprecated, remove this function and use getAuthUserByEmail instead. --- IGNORE ---

  // getAuthUserByUsername: async (userName: string) => {
  //   try {
  //     const [result] = await UserRepository.selectForAuth(userName);

  //     if (!result) {
  //       throw new Error("User not found");
  //     }
  //     return result;
  //   } catch (error) {
  //     console.error(error);
  //     throw new Error("Error getting user by userName");
  //   }
  // },

  getUserById: async (id: number) => {
    try {
      const [user] = await UserRepository.selectById(id);

      if (!user) {
        console.warn("User not found");
      }

      return user;
    } catch (error) {
      console.error("error getting user by id:", error);
      throw new Error("error getting user by id");
    }
  },

  getAllUsers: async () => {
    try {
      return await UserRepository.selectAll();
    } catch (error) {
      console.error("error getting all users:", error);
      throw new Error("error getting all users");
    }
  },

  updateLastSeen: async (userId: number) => {
    console.log("from service");
    try {
      const lastSeenAt = new Date(Date.now());
      return await UserRepository.update(userId, { lastSeenAt });
    } catch (error) {
      console.error("error updating last seen:", error);
      throw new Error("error updating last seen");
    }
  },

  removeUser: async (id: number) => {
    try {
      return await UserRepository.delete(id);
    } catch (error) {
      console.error("error removing user:", error);
      throw new Error("error removing user");
    }
  },
};
