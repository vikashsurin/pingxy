import { redirect } from "@sveltejs/kit";
import { jwtDecode } from "jwt-decode";
import type { User } from "../../../../shared/src/validation.js";

export async function load({ request, cookies }) {
  const token = cookies.get("sessionid");

  if (!token) {
    redirect(302, "/login");
  }

  const decoded = jwtDecode(token) as User;

  const username = decoded.username;
  const uid = decoded.uid;

  // fetch users
  const cookie = request.headers.get("cookie");
  const response = await fetch("http://localhost:3000/chat/users", {
    headers: {
      cookie: cookie as string,
    },
  });

  const data = await response.json();

  return { success: true, username, uid, users: data.users };
}
