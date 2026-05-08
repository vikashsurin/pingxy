import {
  guestFormSchema,
  loginFormSchema,
  registerFormSchema,
} from "@/src/lib/schema/auth";
import z from "zod";
import { authApi } from "../lib/api/authApi";
import { useChatStore } from "../store/chatStore";

function createAuthService() {
  const setToken = (token: string) => {
    localStorage.setItem("token", token);
  };

  const setAuthUser = (user: any) => {
    useChatStore.getState().setAuthUser(user);
  };

  const login = async (formData: z.infer<typeof loginFormSchema>) => {
    return await authApi.login(formData);
  };
  const register = async (formData: z.infer<typeof registerFormSchema>) => {
    return await authApi.register(formData);
  };
  const guestLogin = async (formData: z.infer<typeof guestFormSchema>) => {};

  return {
    setToken,
    setAuthUser,
    login,
    register,
    guestLogin,
  };
}

export const authManager = createAuthService();
