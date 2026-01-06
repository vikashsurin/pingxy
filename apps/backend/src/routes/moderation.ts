// import { Hono } from "hono";
// import { authMiddleware } from "../middlewares/auth";
// import { userSockets, announcedUsers } from "../state";
// import { banUser, unbanUser, getUser, getUserRoles } from "../db/users";
// import type { User } from "../../../../packages/shared/src/lib/utils/validation";

// const app = new Hono();

// // Helper to check permissions
// const canModerate = (user: User): boolean => {
//     return user.roles?.some(r => ["admin", "moderator"].includes(r)) || false;
// };

// app.use("*", authMiddleware);

// app.post("/ban", async (c) => {
//     const user = c.get("jwtPayload")?.user as User;
//     if (!canModerate(user)) {
//         return c.json({ error: "Unauthorized" }, 403);
//     }

//     const { uid, reason, duration } = await c.req.json();

//     if (!uid || !reason) {
//         return c.json({ error: "Missing required fields" }, 400);
//     }

//     // Prevent banning other admins if you are just a moderator (optional complex logic, valid for now to allow all mods/admins to ban)
//     // For safety, maybe prevent banning admins?
//     const targetRoles = getUserRoles(uid);
//     if (targetRoles.includes("admin")) {
//         return c.json({ error: "Cannot ban an admin" }, 403);
//     }

//     const success = banUser(uid, reason, user.uid, duration);

//     if (success) {
//         // Kick immediately if online
//         const socket = userSockets.get(uid);
//         if (socket) {
//             socket.send(JSON.stringify({ type: "system", text: "You have been banned: " + reason }));
//             socket.close();
//             userSockets.delete(uid);
//             announcedUsers.delete(uid);
//         }
//         return c.json({ message: "User banned successfully" });
//     } else {
//         return c.json({ error: "Failed to ban user" }, 500);
//     }
// });

// app.post("/unban", async (c) => {
//     const user = c.get("jwtPayload")?.user as User;
//     if (!canModerate(user)) {
//         return c.json({ error: "Unauthorized" }, 403);
//     }

//     const { uid } = await c.req.json();
//     if (!uid) return c.json({ error: "Missing uid" }, 400);

//     unbanUser(uid);
//     return c.json({ message: "User unbanned" });
// });

// app.post("/kick", async (c) => {
//     const user = c.get("jwtPayload")?.user as User;
//     if (!canModerate(user)) {
//         return c.json({ error: "Unauthorized" }, 403);
//     }

//     const { uid, reason } = await c.req.json();

//     if (!uid) return c.json({ error: "Missing uid" }, 400);

//     const socket = userSockets.get(uid);
//     if (socket) {
//         socket.send(JSON.stringify({ type: "system", text: "You have been kicked: " + (reason || "No reason given") }));
//         socket.close();
//         userSockets.delete(uid);
//         announcedUsers.delete(uid);
//         return c.json({ message: "User kicked" });
//     } else {
//         return c.json({ error: "User not connected" }, 404);
//     }
// });

// export default app;
