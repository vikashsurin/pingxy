import { fail, redirect } from "@sveltejs/kit";
import { userSchema, type User } from "../../../shared/src/index";

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
    const username = data.get("username");
    const gender = data.get("gender");
    const age = data.get("age");
    const country = data.get("country");

    const user: User = {
      uid: crypto.randomUUID(),
      username: username as string,
      gender: gender as string,
      age: Number(age),
      country: country as string,
    };

    const validateUser = userSchema.safeParse(user);

    if (!validateUser.success) {
      console.error("validation error", validateUser.error);
      return fail(400, { username, invalid: "Invalid username" });
    }

    const validUser = validateUser.data;

    if (!username || typeof username !== "string" || username.length < 3)
      return fail(400, { username, invalid: "Invalid username" });

    const url = "http://localhost:8080/api/login";
    // const url = "/api/login";

    const response = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user: validUser }),
    });

    ({ response });
    if (response.ok) {
      const { token } = await response.json();
      if (!token) return;

      cookies.set("sessionid", token, {
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: false,
        secure: false,
        path: "/",
        sameSite: "lax",
      });
    }
  },
};
