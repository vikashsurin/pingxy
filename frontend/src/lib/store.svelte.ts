import { SvelteMap, SvelteSet } from "svelte/reactivity";
import type { Message, User } from "../../../shared/src/validation";

export let users = new SvelteMap<string, User>();

export let unread = new SvelteSet<string>();

export let messages = new SvelteMap<string, Message[]>();

export let activeSocket = $state<User>({
  uid: "global",
  username: "global",
});
