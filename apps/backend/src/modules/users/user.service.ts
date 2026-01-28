import { NewUser } from "@chat/shared/types";
import { UserRepository } from "./user.repository";
import { HTTPException } from "hono/http-exception";

export const UserService = {
  createUser: async (newUser: NewUser) => {
    try {
      const [existingUser] = await UserRepository.selectByUsername(
        newUser.username,
      );
      if (existingUser) {
        throw new Error("Username already exists");
      }

      return UserRepository.insert(newUser);
    } catch (error) {
      console.error("error creating user:", error);
      throw new Error("error creating user");
    }
  },

  getUserByUsername: async (username: string) => {
    try {
      return await UserRepository.selectByUsername(username);
    } catch (error) {
      throw new HTTPException(404, { message: "User not found" });
    }
  },

  getAuthUserByUsername: async (username: string) => {
    try {
      const [result] = await UserRepository.selectForAuth(username);
      if (!result) {
        throw new Error("User not found");
      }
      return result;
    } catch (error) {
      console.error(error);
      throw new Error("Error getting user by username");
    }
  },
  getUserById: async (id: string) => {
    try {
      const user = await UserRepository.selectById(Number(id));

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

  removeUser: async (id: number) => {
    try {
      return await UserRepository.delete(id);
    } catch (error) {
      console.error("error removing user:", error);
      throw new Error("error removing user");
    }
  },
};
