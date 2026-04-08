import { useChatStore } from "../store/chatStore";

function createAuthManager() {
  const setToken = (token: string) => {
    localStorage.setItem("token", token);
  };

  const setAuthUser = (user: any) => {
    useChatStore.getState().setAuthUser(user);
  };

  return {
    setToken,
    setAuthUser,
  };
}

export const authManager = createAuthManager();
