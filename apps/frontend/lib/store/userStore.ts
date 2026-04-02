import { create } from "zustand";


type UserState = {
  users: Record<string, any>;
  userIndex: string[];
  upsertUser: (user: any) => void
}


export const useUserStore = create<UserState>((set) => ({
  users: {},
  userIndex: [], // Store as an array for direct rendering

  upsertUser: (user) =>
    set((state) => {
      const isNew = !state.users[user.id];

      return {
        users: {
          ...state.users,
          [user.id]: user,
        },
        // Only update the array reference if a NEW user is added
        userIndex: isNew ? [...state.userIndex, user.id] : state.userIndex,
      };
    }),
}));
