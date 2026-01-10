import { extendSessionActivity, getSessionUser } from "../../features/sessions";



export async function getAuthUserFromReq(req: Request) {
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return null;

  const cookies = new Bun.CookieMap(cookieHeader);
  const cookie = cookies.get("_Host-session")?.toString();

  if (!cookie) return null;

  const user = await getSessionUser(cookie);

  if (!user) {
    throw new Error("Error while getting user from  session");
  }
  await extendSessionActivity(cookie);
  return user;
}
