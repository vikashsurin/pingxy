import { capitalizeFirst } from '@chat/shared/utils'
import { fail, redirect, type Cookies } from "@sveltejs/kit";
export async function load({ cookies }) {
  const token = cookies.get("_Host-session");

  if (token) {
    throw redirect(302, "/chat");
  }
  if (!token) return { success: false };

  return { success: true };
}

export const actions = {
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
      return fail(401, { username, invalid: error.error || "Login failed" });
    }
    const { user, _ } = await response.json();

    await setCookieHeaders({ response, cookies })

    return { success: true, user };
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

    const user = {
      username: displayName,
      gender: gender,
      age: Number(age),
      country: country,
      roles: ["user"],
    };

    // const validateUser = user
    // if (!validateUser.success) {
    //   return fail(400, { username, invalid:"Invalid user data" });
    // }

    const response = await fetch(`/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: displayName, password, user }),
    });

    if (!response.ok) {
      const error = await response.json();
      return fail(400, {
        username,
        invalid: error.error || "Registration failed",
      });
    }
    await setCookieHeaders({ response, cookies })
  },

  guest: async ({ cookies, request, fetch }) => {
    const data = await request.formData();
    const username = data.get("username") as string;
    const gender = data.get("gender") as string;
    const age = data.get("age");
    const country = data.get("country") as string;

    const displayName = capitalizeFirst(username);

    const user = {
      username: displayName,
      gender: gender,
      age: Number(age),
      country: country,
    };

    // Validation
    // const validateUser = userInsertSchema.safeParse(user);
    // if (!validateUser.success)
    //   return fail(400, { username, invalid: "Invalid data" });

    const response = await fetch(`/api/auth/guest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user }),
    });

    if (!response.ok) {
      const error = await response.json();
      return fail(400, {
        username,
        invalid: error.error || "Guest login failed",
      });
    }

    await setCookieHeaders({ response, cookies })

  },
};

// A function to setCookieHeaders in the browser
async function setCookieHeaders({ response, cookies }: { response: Response, cookies: Cookies }) {

  const setCookieHeaders = response.headers.getSetCookie();

  setCookieHeaders.forEach((cookieString: string) => {
    const firstEquals = cookieString.indexOf('=');
    const name = cookieString.substring(0, firstEquals).trim();

    const afterEquals = cookieString.substring(firstEquals + 1);

    const firstSemicolon = afterEquals.indexOf(';');
    const value = (firstSemicolon === -1
      ? afterEquals
      : afterEquals.substring(0, firstSemicolon)).trim();

    cookies.set(name, value, {
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: true,
      secure: false,
      path: "/",
      sameSite: "lax",
    });
  });
}
