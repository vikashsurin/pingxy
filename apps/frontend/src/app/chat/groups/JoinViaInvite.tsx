import { Button } from "@/components/ui/button";
import { useJoinViaInvite } from "@/src/hooks/api/conversationInvites";

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

        <Button
          variant={"default"}
          disabled={isPending}
          className={"rounded-sm"}
        >
          {isPending ? "Joining..." : "Join"}
        </Button>
      </form>
    </div>
  );
}
