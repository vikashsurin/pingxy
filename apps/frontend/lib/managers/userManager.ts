import { useUserStore } from "../store/userStore";

const createUserManager = () => {
  const upsertOnlineUser = (user: any) => {
    useUserStore.getState().upsertUser(user);
  };
  return { upsertOnlineUser };
};

export const userManager = createUserManager();
