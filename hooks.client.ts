// import { INTERNAL_BACKEND_URL } from "$env/static/private";
// import type { HandleFetch } from "@sveltejs/kit";
// import { sequence } from "@sveltejs/kit/hooks";

// export const handleFetch: HandleFetch = async ({ event, request, fetch }) => {
//   const isApiRequest = request.url.startsWith(event.url.origin + "/api");
//   console.log({ from: request })
//   if (isApiRequest && INTERNAL_BACKEND_URL) {
//     const newUrl = request.url.replace(event.url.origin, INTERNAL_BACKEND_URL);
//     request = new Request(newUrl, request);
//   }

//   if (isApiRequest) {
//     const cookies = event.request.headers.get("cookie");
//     if (cookies) request.headers.set("cookie", cookies);
//   }

//   const response = await fetch(request);

//   return response;
// };
