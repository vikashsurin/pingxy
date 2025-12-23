import { redirect } from "@sveltejs/kit";
import { jwtDecode } from "jwt-decode";
import type { User } from "../../../../shared/src/index";

export async function load({ request, cookies }) {
  const token = cookies.get("sessionid");

  if (!token) {
    redirect(302, "/");
  }

  const decoded: { user: User } = jwtDecode(token);
  const user: User = decoded.user as User;

  // fetch loggesd in users list
  const cookie = request.headers.get("cookie");
  const response = await fetch("http://backend:3000/api/chat/users", {
    headers: {
      cookie: cookie as string,
    },
  });

  const data = await response.json();

  return { success: true, user: user, users: data.users };
}
