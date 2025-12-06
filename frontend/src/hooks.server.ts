// /** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
  const url = event.url;
  console.log({ url: event.url });
  console.log({ url });
  const searchParams = event.url.search.slice(1);

  const newUrl = `http://localhost:8080/api/${searchParams}`;

  const response = await resolve(event);

  return response;
}

// import type { Handle } from '@sveltejs/kit';

// export const handle: Handle = async ({ event, resolve }) => {
// 	if (event.url.pathname.startsWith('/custom')) {
// 		return new Response('custom response');
// 	}

// 	const response = await resolve(event);
// 	return response;
// };
