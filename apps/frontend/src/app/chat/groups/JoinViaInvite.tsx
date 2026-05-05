import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useJoinViaInvite } from "@/src/hooks/api/conversationInvites";
import { IconAlertCircle } from "@tabler/icons-react";

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
        <Input
          type="text"
          name="invite-code"
          placeholder="Enter invite code"
          className="w-max"
        />

        <Button
          variant={"default"}
          disabled={isPending}
          className={"rounded-sm"}
        >
          {isPending ? "Joining..." : "Join"}
        </Button>
      </form>
      <div>
        {isError && <p className="flex gap-1 items-center text-xs bg-red-100 text-red-700 rounded-sm px-1.5 py-1 w-max mt-1"><IconAlertCircle size={14} /> {error?.message}</p>}
      </div>
    </div >
  );
}
