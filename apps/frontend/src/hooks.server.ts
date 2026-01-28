import { env } from "$env/dynamic/private";
import { sequence } from "@sveltejs/kit/hooks";
import type { Handle, HandleFetch } from "@sveltejs/kit";

const INTERNAL_BACKEND_URL = env.INTERNAL_BACKEND_URL

// 1. THE NETWORKING HOOK (URL Swapping & Cookie Syncing)
export const handleFetch: HandleFetch = async ({ event, request, fetch }) => {
  const isApiRequest = request.url.startsWith(event.url.origin + "/api");

  if (isApiRequest && INTERNAL_BACKEND_URL) {
    const newUrl = request.url.replace(event.url.origin, INTERNAL_BACKEND_URL);
    request = new Request(newUrl, request);
  }

  if (isApiRequest) {
    const cookies = event.request.headers.get("cookie");
    if (cookies) request.headers.set("cookie", cookies);
  }

  const response = await fetch(request);

  return response;
};

// 2. THE AUTH HOOK (Populating Locals)
const authHandle: Handle = async ({ event, resolve }) => {
  const session = event.cookies.get("_Host-session");

  // Only fetch user if a session exists and we are on a route that needs it
  // (e.g., the /chat section)
  if (session && event.url.pathname.startsWith("/chat")) {
    // This 'fetch' call will trigger 'handleFetch' automatically!
    const response = await event.fetch("/api/auth/me");

    if (response.ok) {
      const { user } = await response.json();
      event.locals.user = user;
    } else {
      event.locals.user = null;
      // Optional: clear invalid cookie
      event.cookies.delete("_Host-session", { path: "/" });
    }
  } else {
    event.locals.user = null;
  }

  return resolve(event);
};

// 3. COMBINE HANDLES
export const handle = sequence(authHandle);
