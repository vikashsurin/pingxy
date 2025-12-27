import { fail, redirect } from "@sveltejs/kit";
import { userSchema, type User } from "../../../shared/src/lib/utils/validation.js";
import { capitalizeFirst } from "../../../shared/src/lib/utils/string.js";

export async function load({ cookies }) {
  const token = cookies.get("sessionid");

  if (token) {
    throw redirect(302, "/chat");
  }
  if (!token) return { success: false };

  return { success: true };
}

export const actions = {
  login: async ({ cookies, request, fetch }) => {
    const data = await request.formData();
    const username = data.get("username") as string;
    const password = data.get("password") as string;

    if (!username || !password) {
      return fail(400, { username, invalid: "Missing credentials" });
    }

    const displayName = capitalizeFirst(username);

    const response = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: displayName, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      return fail(401, { username, invalid: error.error || "Login failed" });
    }

    const { token } = await response.json();
    cookies.set("sessionid", token, {
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: false,
      secure: false,
      path: "/",
      sameSite: "lax",
    });

    // Redirect handled by page reload or client logic, but actions usually redirect on success or return success
    // If we just return, form success.
  },

  register: async ({ cookies, request, fetch }) => {
    const data = await request.formData();
    const username = data.get("username") as string;
    const password = data.get("password") as string;
    const gender = data.get("gender") as string;
    const age = data.get("age");
    const country = data.get("country") as string;

    if (!username || !password || username.length < 3) {
      return fail(400, { username, invalid: "Invalid input" });
    }

    // Capitalize for display consistency
    const displayName = capitalizeFirst(username);

    const user: User = {
      uid: crypto.randomUUID(),
      username: displayName,
      gender: gender,
      age: Number(age),
      country: country,
    };

    const validateUser = userSchema.safeParse(user);
    if (!validateUser.success) {
      return fail(400, { username, invalid: "Invalid user data" });
    }

    const response = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: displayName, password, user }),
    });

    if (!response.ok) {
      const error = await response.json();
      return fail(400, { username, invalid: error.error || "Registration failed" });
    }

    const { token } = await response.json();
    cookies.set("sessionid", token, {
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: false,
      secure: false,
      path: "/",
      sameSite: "lax",
    });
  },

  guest: async ({ cookies, request, fetch }) => {
    const data = await request.formData();
    const username = data.get("username") as string;
    const gender = data.get("gender") as string;
    const age = data.get("age");
    const country = data.get("country") as string;

    const displayName = capitalizeFirst(username);

    const user: User = {
      uid: crypto.randomUUID(),
      username: displayName,
      gender: gender,
      age: Number(age),
      country: country,
    };

    // Validation
    const validateUser = userSchema.safeParse(user);
    if (!validateUser.success) return fail(400, { username, invalid: "Invalid data" });

    const response = await fetch("http://localhost:3000/api/auth/guest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user }),
    });

    if (!response.ok) {
      const error = await response.json();
      return fail(400, { username, invalid: error.error || "Guest login failed" });
    }

    const { token } = await response.json();
    cookies.set("sessionid", token, {
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: false,
      secure: false,
      path: "/",
      sameSite: "lax",
    });
  }
};
