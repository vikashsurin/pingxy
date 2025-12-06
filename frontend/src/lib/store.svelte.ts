import { SvelteMap, SvelteSet } from "svelte/reactivity";
import type { Message, User } from "../../../shared/src/index";

export let users = new SvelteMap<string, User>();

export let unread = new SvelteSet<string>();

export let messages = new SvelteMap<string, Message[]>();

export let activeSocket = $state<User>({
  uid: "global",
  username: "global",
  age: "0",
  gender: "0",
  country: "0",
});
