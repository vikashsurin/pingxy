import { setCookieHeaders } from "$lib/server/cookie";
import { capitalizeFirst } from "@pingxy/shared";
import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ cookies }) => {
  const token = cookies.get("_Host-session");

  if (token) {
    throw redirect(302, "/chat");
  }
  if (!token) return { success: false };

  return { success: true };
};


export const actions: Actions = {
  default: async ({ request, fetch, cookies }) => {
    const data = await request.formData();
    const username = data.get("username") as string;
    const password = data.get("password") as string;

    if (!username || !password) {
      return fail(400, { username, invalid: "Missing credentials" });
    }
    const displayName = capitalizeFirst(username);
    const response = await fetch(`/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: displayName, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      console.error("error: ", error);
      return fail(401, { username, invalid: error.error || "Login failed" });
    }
    const { user, _ } = await response.json();

    await setCookieHeaders({ response, cookies });

    return { success: true, user };
  },
}
