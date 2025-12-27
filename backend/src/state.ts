import { type User } from "../../shared/src/lib/utils/validation.js";

export let users: Map<string, User> = new Map();
export let existingUsernames: Set<string> = new Set();
export let userSockets = new Map();

