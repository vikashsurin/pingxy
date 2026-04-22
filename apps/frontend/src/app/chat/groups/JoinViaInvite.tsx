import { useJoinViaInvite } from "@/src/queries/conversationInvite";

export default function JoinViaInvite() {
  const { mutate, isPending, isError, error } = useJoinViaInvite();

  function handleSubmit(formData: FormData) {
    const inviteCode = formData.get("invite-code");
    mutate(inviteCode as string);
  }
  return (
    <div>
      <p className="font-bold mb-1">Join via invite code</p>
      <form action={handleSubmit} className="flex gap-2">
        <input
          type="text"
          name="invite-code"
          placeholder="Enter invite code"
          className="border px-2 py-1 rounded border-gray-300"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-2 py-0.5 rounded hover:bg-blue-500 transition-colors active:bg-blue-700"
          disabled={isPending}
        >
          {isPending ? "Joining..." : "Join"}
        </button>
      </form>
    </div>
  );
}
