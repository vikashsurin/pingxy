import { redirect } from "@sveltejs/kit";

export async function load({ request, cookies }) {
  const token = cookies.get("_Host-session");

  if (!token) {
    redirect(302, "/");
  }

  // fetch logged in users list and current user profile
  const cookie = request.headers.get("cookie");
  await fetch("http://localhost:3000/api/auth/verify", {
    headers: { cookie: cookie as string },
  });
  // const [usersRes, meRes] = await Promise.all([
  //   fetch("http://localhost:3000/api/users", {
  //     headers: { cookie: cookie as string },
  //   }),
  //   fetch("http://localhost:3000/api/users/me", {
  //     headers: { cookie: cookie as string },
  //   }),
  // ]);

  const response = await fetch("http://localhost:3000/api/auth/me", {
    headers: { cookie: cookie as string },
  });

  const { user } = await response.json();
  if (!user) {
    cookies.delete("_Host-session", { path: "/" });
    redirect(302, "/");
  }

  return { success: true, user };
}
