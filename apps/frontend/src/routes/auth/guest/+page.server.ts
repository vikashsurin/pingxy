import { setCookieHeaders } from "$lib/server/cookie";
import { capitalizeFirst } from "@pingxy/shared";
import { fail } from "@sveltejs/kit";
import type { Actions } from "./$types";


export const actions: Actions = {
  default: async ({ cookies, request, fetch }) => {
    const formData = await request.formData();
    const username = formData.get("username") as string;
    const gender = formData.get("gender") as string;
    const age = formData.get("age");
    const country = formData.get("country") as string;

    const data = {
      gender: gender,
      age: Number(age),
      country: country,
      roles: ["guest"],
    };

    const response = await fetch(`/api/auth/guest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: capitalizeFirst(username), data }),
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
