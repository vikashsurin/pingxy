import { fetchUserDetails } from "../api/user.api";

export const UserService = {
  getUser: async ({
    customFetch,
    id,
  }: {
    customFetch: typeof fetch;
    id: number;
  }) => {
    const user = await fetchUserDetails({ customFetch, id });

    if (!user) {
      return null;
    }
    return user;
  },
};
