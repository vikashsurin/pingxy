import { useDeleteInvites } from "@/src/hooks/api/conversationInvites";
import { useState } from "react";

export default function DeleteSelectedInvites({
  selectedIds,
  clearSelected,
}: {
  selectedIds: number[];
  clearSelected: () => void;
}) {
  const [confirmText, setConfirmText] = useState("");

  console.log({ confirmText });
  const { mutate, isSuccess, isPending, error } = useDeleteInvites();
  function handleDelete() {
    if (confirmText !== "delete") return;
    mutate(selectedIds, {
      onSuccess: () => {
        setConfirmText("");
        clearSelected();
      },
    });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleDelete();
      }}
      className="fixed bottom-8 rounded-lg shadow-xl  right-8 w-max bg-gray-100 border border-gray-400 p-4 z-999 flex flex-col gap-2"
    >
      <p className="font-bold text-sm min-w-sm">Delete Selected Invites?</p>
      <p>
        You are about to delete <b>{selectedIds.length}</b> invites. This cannot
        be undone.
      </p>
      <p className="text-sm text-gray-600 mt-2">
        Type <b>{"delete"}</b> to confirm
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          className="border px-2 text-sm border-gray-300 rounded w-full"
          title="confirm"
          placeholder="delete"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
        />
        <button
          type="submit"
          className="bg-red-500 px-3 py-1 rounded text-white hover:bg-red-600 active:bg-red-700 ml-auto "
          disabled={isPending}
        >
          {isPending ? "Deleting..." : isSuccess ? "Deleted" : "Delete"}
        </button>
      </div>
    </form>
  );
}
