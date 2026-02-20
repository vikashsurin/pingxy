import { blockUserRequest } from "$lib/server/api/block";
import { fail, type Actions } from "@sveltejs/kit";

export const actions: Actions = {
  block: async ({ locals, request, fetch }) => {
    if (!locals.user) {
      return fail(401, { message: "Unauthorized" });
    }
    const formData = await request.formData();
    const blockedId = Number(formData.get("userId"));

    if (!blockedId || isNaN(blockedId)) {
      return fail(400, { message: "User ID is required" });
    }

    try {
      const blocked = await blockUserRequest({
        customFetch: fetch,
        blockerId: Number(locals.user.id),
        blockedId: blockedId,
      });
      return { success: true, blocked };
    } catch (error) {
      console.error("Error blocking user:", error);
      return fail(500, { message: "Failed to block user" });
    }
  },
};
