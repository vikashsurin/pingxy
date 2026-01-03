import { redirect } from "@sveltejs/kit";

export async function load({ request, cookies }) {
  const token = cookies.get("sessionid");

  if (!token) {
    redirect(302, "/");
  }

  // fetch logged in users list and current user profile
  const cookie = request.headers.get("cookie");
  const [usersRes, meRes] = await Promise.all([
      fetch("http://localhost:3000/api/users", { headers: { cookie: cookie as string } }),
      fetch("http://localhost:3000/api/users/me", { headers: { cookie: cookie as string } })
  ]);

  if (!usersRes.ok || !meRes.ok) {
    cookies.delete("sessionid", { path: "/" });
    redirect(302, "/");
  }

  const usersData = await usersRes.json();
  const meData = await meRes.json();

  return { success: true, user: meData.user, users: usersData.users };
}
