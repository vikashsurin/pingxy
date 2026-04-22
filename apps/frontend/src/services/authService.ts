import { authApi } from "../lib/api/auth";
import { useChatStore } from "../store/chatStore";

function createAuthService() {
  const setToken = (token: string) => {
    localStorage.setItem("token", token);
  };

  const setAuthUser = (user: any) => {
    useChatStore.getState().setAuthUser(user);
  };

  const login = async (formData: FormData) => {
    return await authApi.login(formData);
  };
  const register = async (formData: FormData) => {
    return await authApi.register(formData);
  };
  const guest = async (formData: FormData) => {};

  return {
    setToken,
    setAuthUser,
    login,
    register,
    guest,
  };
}

export const authManager = createAuthService();
