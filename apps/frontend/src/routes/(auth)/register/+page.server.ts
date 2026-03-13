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
  default: async ({ cookies, request, fetch }) => {
    const formData = await request.formData();
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const gender = formData.get("gender") as string;
    const age = Number(formData.get("age"));
    const country = formData.get("country") as string;

    if (!username || !password || username.length < 3) {
      return fail(400, { username, invalid: "Invalid input" });
    }

    const response = await fetch(`/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: capitalizeFirst(username),
        password,
        confirmPassword,
        gender,
        age,
        country,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return fail(400, {
        username,
        invalid: error.error || "Registration failed",
      });
    }
    await setCookieHeaders({ response, cookies });
  },
};
