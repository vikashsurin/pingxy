import { redirect } from "@sveltejs/kit";
import { jwtDecode } from "jwt-decode";
export async function load({ cookies }) {
  const token = cookies.get("sessionid");

  if (!token) {
    redirect(302, "/chat/login");
  }

  const decoded = jwtDecode(token);
  const username = decoded.username;
  const uid = decoded.uid;

  return { success: true, username, uid };
}
