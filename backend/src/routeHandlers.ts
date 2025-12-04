import type { BunRequest } from "bun";

// type RouteHandler<T extends string = string> = (
//   req: BunRequest<T>
// ) => Response | Promise<Response>;

export const apiRoutes = {
  "/": {
    GET: (req: BunRequest) => {
      // return Response.json({ name: "John Doe" });
    },
  },
};
