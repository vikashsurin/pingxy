import { redirect } from "@sveltejs/kit";
import { jwtDecode } from "jwt-decode";

export async function load({ cookies }) {
  const token = cookies.get("sessionid");

  if (!token) {
    redirect(302, "/login");
  }

  const decoded = jwtDecode(token);
  const username = decoded.username;
  const uid = decoded.uid;

  // fetch users
  const response = await fetch("http://localhost:3000/chat/users", {});
  const data = await response.json();

  return { success: true, username, uid, users: data.users };
}
