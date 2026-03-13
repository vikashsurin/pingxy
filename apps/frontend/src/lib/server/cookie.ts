import { type Cookies } from "@sveltejs/kit";

export async function setCookieHeaders({
  response,
  cookies,
}: {
  response: Response;
  cookies: Cookies;
}) {
  const setCookieHeaders = response.headers.getSetCookie();

  setCookieHeaders.forEach((cookieString: string) => {
    const firstEquals = cookieString.indexOf("=");
    const name = cookieString.substring(0, firstEquals).trim();

    const afterEquals = cookieString.substring(firstEquals + 1);

    const firstSemicolon = afterEquals.indexOf(";");
    const value = (
      firstSemicolon === -1
        ? afterEquals
        : afterEquals.substring(0, firstSemicolon)
    ).trim();

    console.log({ name, value });

    cookies.set(name, value, {
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: true,
      secure: false,
      path: "/",
      sameSite: "lax",
    });
  });
}
