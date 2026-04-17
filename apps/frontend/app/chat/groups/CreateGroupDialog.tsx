import Primary from "@/components/ui/buttons/Primary";
import Secondary from "@/components/ui/buttons/Secondary";
import Input from "@/components/ui/Input";
import RadioGroup from "@/components/ui/RadioGroup";
import { conversationManager } from "@/lib/managers/conversationManager";
import queryClient from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

export default function CreateGroupDialog({
  setIsCreateGroupDialogOpen,
}: {
  setIsCreateGroupDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [visibility, setVisibility] = useState("private");

  const { mutate, isPending, isError } = useMutation({
    mutationFn: async (formdata: FormData) => {
      return await conversationManager.createGroup(formdata);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversations", "group"],
      });
      setIsCreateGroupDialogOpen(false);
    },
    onError: () => {},
  });

  function handleSubmit(formData: FormData) {
    mutate(formData);
  }

  return (
    <div className="fixed flex items-center justify-center inset-0 bg-gray-900/50 ">
      <div className="border p-6 rounded-xl bg-gray-100 shadow-xl border-gray-300 min-w-lg min-h-lg flex flex-col gap-4">
        <h2 className="font-bold text-lg">Create Group</h2>
        <form action={handleSubmit} className="flex flex-col gap-2">
          <RadioGroup
            name="visibility"
            label="Visibility"
            value={visibility}
            onChange={(value) => setVisibility(value)}
            options={[
              { id: "private", name: "Private", value: "private" },
              { id: "public", name: "Public", value: "public" },
            ]}
          />
          <Input name="name" label="Name" type="text" placeholder="name" />
          <Input
            name="description"
            label="Description"
            type="text"
            placeholder="description"
          />
          <Input
            name="maxParticipants"
            label="Max Participants"
            type="number"
            max={50}
            min={2}
          />
          <div className="flex gap-2 justify-end">
            <Secondary
              label="Cancel"
              type="button"
              onClick={() => setIsCreateGroupDialogOpen(false)}
              disabled={isPending}
            />
            <Primary
              label={isPending ? "Creating..." : "Create"}
              type="submit"
              disabled={isPending}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
