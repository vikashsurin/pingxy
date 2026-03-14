import { createBlockApi } from "$lib/api/block";
import type { Action } from "@sveltejs/kit";
import { fail } from "@sveltejs/kit";


export const blockAction: Action = async ({ locals, request, fetch }) => {
  if (!locals.user) {
    return fail(401, { message: "Unauthorized" });
  }

  console.log("blocking user::")
  const formData = await request.formData();
  const blockedId = Number(formData.get("userId"));


  if (!blockedId || isNaN(blockedId)) {
    return fail(400, { message: "Block ID is required" });
  }

  const blockApi = createBlockApi(fetch);
  try {
    const blocked = await blockApi.blockUser({
      blockerId: locals.user.id,
      blockedId: blockedId,
    });
    return { success: true, blocked };
  } catch (error) {
    console.error("Error blocking user:", error);
    return fail(500, { message: "Failed to block user" });
  }
};

export const unblockAction: Action = async ({ locals, request, fetch }) => {
  if (!locals.user) {
    return fail(401, { message: "Unauthorized" });
  }
  const formData = await request.formData();
  const blockId = Number(formData.get("blockId"));

  if (!blockId || isNaN(blockId)) {
    return fail(400, { message: "Block ID is required" });
  }

  const blockApi = createBlockApi(fetch);
  try {
    const unblocked = await blockApi.unblockUser({
      blockId: blockId,
    });
    return { success: true, unblocked };
  } catch (error) {
    console.error("Error unblocking user:", error);
    return fail(500, { message: "Failed to unblock user" });
  }
};
