import { createBlockApi } from "$lib/api/block";
import type { Action } from "@sveltejs/kit";
import { fail } from "@sveltejs/kit";

export const blockAction: Action = async ({ locals, request, fetch }) => {
  const blockApi = createBlockApi(fetch);

  if (!locals.user) {
    return fail(401, { message: "Unauthorized" });
  }
  const formData = await request.formData();
  const blockedId = Number(formData.get("userId"));

  if (!blockedId || isNaN(blockedId)) {
    return fail(400, { message: "User ID is required" });
  }

  try {
    const blocked = await blockApi.blockUser({
      blockerId: Number(locals.user.id),
      blockedId: blockedId,
    });
    return { success: true, blocked };
  } catch (error) {
    console.error("Error blocking user:", error);
    return fail(500, { message: "Failed to block user" });
  }
};
