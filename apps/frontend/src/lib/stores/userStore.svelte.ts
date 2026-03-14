// import { userApi } from "$lib/api/user.api";
import { createUserApi } from "$lib/api/user.api";
import type { User } from "@pingxy/shared";
import { SvelteMap, SvelteSet } from "svelte/reactivity";

class UserStore {
  blockedUserIds = new Set<number>();

  #cache = new SvelteMap<number, User>();
  #pending = new SvelteSet();

  isBlocked(id: number) {
    this.blockedUserIds.has(id);
  }

  get(id: number) {
    return this.#cache.get(id);
  }

  getOnlineUsers() {
    return Array.from(this.#cache.values()).filter((u) => u.isOnline);
  }

  getUsers() {
    return Array.from(this.#cache.values());
  }

  getOfflineUsers() {
    return Array.from(this.#cache.values()).filter((u) => !u.isOnline);
  }

  upsert(user: User) {
    this.#cache.set(user.id, user);
  }

  setOnline(id: number) {
    const user = this.#cache.get(id);
    if (user) this.#cache.set(id, { ...user, isOnline: true });
  }

  setOffline(id: number) {
    const user = this.#cache.get(id);
    if (user) this.#cache.set(id, { ...user, isOnline: false });
  }

  // filter blocked users
  seedFromOnlineUsers(users: any[]) {
    for (const user of users) {
      this.#cache.set(user.id, { ...user, isOnline: true });
    }
  }

  async fetchIfMissing(id: number) {
    if (this.#cache.has(id) || this.#pending.has(id)) return;

    this.#pending.add(id);
    const userApi = createUserApi();
    const user = await userApi.fetchUserDetails({ id });

    this.#cache.set(id, { ...user, isOnline: false });
    this.#pending.delete(id);
  }

  // onlineUsers =
  // onlineUsers =
  // blockedUsers
}

export const userStore = new UserStore();
