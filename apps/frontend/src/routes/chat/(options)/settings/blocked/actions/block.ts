import { BlockService } from "$lib/server/services/block.service";
import type { Action } from "@sveltejs/kit";
import { fail } from "@sveltejs/kit";

export const unblockAction: Action = async ({ locals, request, fetch }) => {
  if (!locals.user) {
    return fail(401, { message: "Unauthorized" });
  }
  const formData = await request.formData();
  const blockId = Number(formData.get("blockId"));

  if (!blockId || isNaN(blockId)) {
    return fail(400, { message: "Block ID is required" });
  }

  try {
    const unblocked = await BlockService.unblock({
      customFetch: fetch,
      blockId: blockId,
    });
    return { success: true, unblocked };
  } catch (error) {
    console.error("Error unblocking user:", error);
    return fail(500, { message: "Failed to unblock user" });
  }
};
