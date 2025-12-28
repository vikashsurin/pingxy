import { fail, redirect } from "@sveltejs/kit";

export const actions = {
  pause: async ({ request, fetch }) => {
    const response = await fetch("http://localhost:3000/api/users/pause", {
      method: "POST",
      headers: {
        cookie: request.headers.get("cookie") || ""
      }
    });

    if (!response.ok) {
        return fail(response.status, { error: true });
    }

    // Likely want to logout or show a "paused" state
    // For now, let's redirect to logout to ensure session is cleared/updated logic happens
    throw redirect(303, "/chat/logout");
  },

  delete: async ({ request, fetch }) => {
     const response = await fetch("http://localhost:3000/api/users/me", {
      method: "DELETE",
      headers: {
        cookie: request.headers.get("cookie") || ""
      }
    });

    if (!response.ok) {
        return fail(response.status, { error: true });
    }

    throw redirect(303, "/chat/logout");
  }
};
