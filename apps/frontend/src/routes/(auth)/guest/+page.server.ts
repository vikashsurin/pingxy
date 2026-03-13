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
    const gender = formData.get("gender") as string;
    const age = formData.get("age");
    const country = formData.get("country") as string;

    const response = await fetch(`/api/auth/guest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: capitalizeFirst(username),
        gender,
        age: Number(age),
        country,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return fail(400, {
        username,
        invalid: error.error || "Guest login failed",
      });
    }

    await setCookieHeaders({ response, cookies });
  },
};
