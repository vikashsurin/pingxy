import { loginFormSchema, registerFormSchema } from "@/src/lib/schema/auth";
import { User } from "@pingxy/shared";
import z from "zod";
import { authApi } from "../lib/api/authApi";
import { useChatStore } from "../store/chatStore";

function createAuthService() {
  const setToken = (token: string) => {
    localStorage.setItem("token", token);
  };

  const setAuthUser = (user: User) => {
    useChatStore.getState().setAuthUser(user);
  };

  const login = async (formData: z.infer<typeof loginFormSchema>) => {
    return await authApi.login(formData);
  };
  const register = async (formData: z.infer<typeof registerFormSchema>) => {
    return await authApi.register(formData);
  };

  return {
    setToken,
    setAuthUser,
    login,
    register,
  };
}

export const authManager = createAuthService();
