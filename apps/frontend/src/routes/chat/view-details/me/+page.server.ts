import { fail } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";

const INTERNAL_BACKEND_URL = env.INTERNAL_BACKEND_URL

export const actions = {
  update: async ({ request, cookies, fetch }) => {
    const data = await request.formData();
    const country = data.get("country");
    const bio = data.get("bio");
    const gender = data.get("gender");

    // Validation
    if (!country) {
      return fail(400, { missing: true });
    }

    // Prepare update payload
    const payload = {
      country,
      bio,
      gender
    };

    const response = await fetch(`${INTERNAL_BACKEND_URL}/api/users/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        cookie: request.headers.get("cookie") || ""
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      return fail(response.status, { error: true });
    }

    const resData = await response.json();

    return { success: true, user: resData.user };
  },
};
