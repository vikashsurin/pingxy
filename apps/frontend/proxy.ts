import { NextResponse, type NextRequest } from "next/server";

export default function proxy(request: NextRequest) {
  const token = request.cookies.get("_Host-session")?.value;

  console.log("TOKEN==", token);

  const { pathname } = request.nextUrl;

  if (token && pathname.startsWith("/auth")) {
    console.log("redirecting to chat");
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  if (!token && pathname.startsWith("/chat")) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/chat/:path*", "/auth/:path*"],
};
    