import { redirect } from "@sveltejs/kit";
import { jwtDecode } from "jwt-decode";
import type { User } from "@pingxy/shared/domain/user/user.types";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ request, cookies }) => {
  const token = cookies.get("sessionid");

  if (!token) {
    redirect(302, "/");
  }

  const decoded: { user: User } = jwtDecode(token);
  const user: User = decoded.user as User;

  // fetch loggesd in users list
  const cookie = request.headers.get("cookie");
  const response = await fetch("/", {
    headers: {
      cookie: cookie as string,
    },
  });

  const data = await response.json();

  return { success: true, user: user, users: data.users };
};
