import { capitalizeFirst } from "@pingxy/shared/utils/string";
import { fail, redirect, type Cookies } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import type { Actions } from "./$types";

export const load: PageServerLoad = async ({ cookies }) => {
  const token = cookies.get("_Host-session");

  if (token) {
    throw redirect(302, "/chat");
  }
  if (!token) return { success: false };

  return { success: true };
};

export const actions: Actions = {
  login: async ({ request, fetch, cookies }) => {
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

  register: async ({ cookies, request, fetch }) => {
    const formData = await request.formData();
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const gender = formData.get("gender") as string;
    const age = formData.get("age");
    const country = formData.get("country") as string;

    if (!username || !password || username.length < 3) {
      return fail(400, { username, invalid: "Invalid input" });
    }

    // Capitalize for display consistency
    const displayName = capitalizeFirst(username);

    const data = {
      gender: gender,
      age: Number(age),
      country: country,
      roles: ["user"],
    };

    const response = await fetch(`/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: displayName,
        password,
        confirmPassword,
        data,
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

  guest: async ({ cookies, request, fetch }) => {
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

// A function to setCookieHeaders in the browser
async function setCookieHeaders({
  response,
  cookies,
}: {
  response: Response;
  cookies: Cookies;
}) {
  const setCookieHeaders = response.headers.getSetCookie();

  setCookieHeaders.forEach((cookieString: string) => {
    const firstEquals = cookieString.indexOf("=");
    const name = cookieString.substring(0, firstEquals).trim();

    const afterEquals = cookieString.substring(firstEquals + 1);

    const firstSemicolon = afterEquals.indexOf(";");
    const value = (
      firstSemicolon === -1
        ? afterEquals
        : afterEquals.substring(0, firstSemicolon)
    ).trim();

    cookies.set(name, value, {
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: true,
      secure: false,
      path: "/",
      sameSite: "lax",
    });
  });
}
