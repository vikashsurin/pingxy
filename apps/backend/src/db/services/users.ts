import { NewUser, User } from "@chat/shared/src/lib/utils/validation";
import * as queries from "../queries/index";
import { HTTPException } from "hono/http-exception";

export const createUser = async (newUser: NewUser) => {
  try {
    // Check if username is unique
    const [existingUser] = await queries.selectUserByUsername(newUser.username);
    if (existingUser) {
      throw new Error("Username already exists");
    }

    return queries.insertUser(newUser);
  } catch (error) {
    console.error("error creating user:", error);
    throw new Error("error creating user");
  }
};

export const getUserByUsername = async (username: string) => {
  try {
    return await queries.selectUserByUsername(username);
  } catch (error) {
    // console.error("error getting user by username:", error);
    // throw new Error("error getting user by username");
    throw new HTTPException(404, { message: "Error getting User by username..", cause: error })
  }
};



export const getAuthUserByUsername = async (username: string) => {
  try {
    const [result] = await queries.selectAuthUserByUsername(username);
    if (!result) {
      throw new Error("User not found")
    }
    return result
  } catch (error) {
    throw new HTTPException(404, { message: "Error getting User by username..", cause: error })
  }
};

export const getUserById = async (id: string) => {
  try {
    const user = await queries.selectUserById(Number(id));

    if (!user) {
      console.warn("User not found");
    }

    return user;
  } catch (error) {
    console.error("error getting user by id:", error);
    throw new Error("error getting user by id");
  }
};

export const getAllUsers = async () => {
  try {
    return await queries.selectAllUsers();
  } catch (error) {
    console.error("error getting all users:", error);
    throw new Error("error getting all users");
  }
};

export const removeUser = async (id: number) => {
  try {
    return await queries.deleteUser(id);
  } catch (error) {
    console.error("error removing user:", error);
    throw new Error("error removing user");
  }
};
