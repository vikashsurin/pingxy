import { useUserStore } from "../store/userStore";

const createUserService = () => {
  const upsertOnlineUser = (user: any) => {
    useUserStore.getState().upsertUser(user);
  };
  return { upsertOnlineUser };
};

export const userManager = createUserService();
