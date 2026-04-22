import { cookies } from "next/headers";

export const getCookie = async () => {
  const cookieStore = await cookies();
  const cookie = cookieStore.get("_Host-session");
};
