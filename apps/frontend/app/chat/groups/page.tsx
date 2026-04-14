"use client";

import Primary from "@/components/ui/buttons/Primary";
import Secondary from "@/components/ui/buttons/Secondary";
import Input from "@/components/ui/Input";
import RadioGroup from "@/components/ui/RadioGroup";
import { conversationManager } from "@/lib/managers/conversationManager";
import { useConversationStore } from "@/lib/store/conversationStore";
import { useMutation } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import React, { useState } from "react";

export default function Page() {
  return (
    <div className="m-2  flex flex-col gap-6  p-4 rounded-lg border-gray-300 ">
      <RoomPageHeader />
      <div className="grid grid-cols-4 gap-2">
        <Groups />
      </div>
    </div>
  );
}

function Groups() {
  const [selectedId, setSelected] = useState("");
  const conversationIdx = useConversationStore(
    (state) => state.conversationIdx,
  );
  console.log({ conversationIdx });
  return Array.from(conversationIdx.values()).map((id) => (
    <ConversationItem
      key={id}
      id={id}
      selectedId={selectedId}
      setSelected={setSelected}
    />
  ));
}

const ConversationItem = ({
  id,
  selectedId,
  setSelected,
}: {
  id: string | number;
  selectedId: string;
  setSelected: (id: string) => void;
}) => {
  const conv = useConversationStore((state) => state.conversations[id]);

  console.log({ conv });

  if (conv.type === "direct") return null;

  return (
    <div className="border flex flex-col gap-2 border-gray-300 p-4 rounded  aspect-square bg-gray-100 hover:shadow-xl transition-shadow duration-200 ease-in-out hover:bg-gray-50">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-xl ">{conv.name}</h4>
        <p className="text-xs text-gray-400">
          {conv.isPrivate ? "Private" : "Public"}
        </p>
      </div>
      <p className="bg-gray-200 p-2 rounded text-sm">
        {conv.description || "No description"}
      </p>
      <div title="separator" className="border mt-auto border-gray-300"></div>
      <div className="flex justify-between items-baseline mt-auto">
        <p className="text-sm">20 Active Now</p>
        <button
          type="button"
          className="bg-blue-600 text-white px-2 py-0.5 rounded hover:bg-blue-500 transition-colors active:bg-blue-700"
        >
          Join
        </button>
      </div>
    </div>
  );
};

function RoomPageHeader() {
  const [isCreateGroupDialogOpen, setIsCreateGroupDialogOpen] = useState(false);

  return (
    <div className="flex gap-6 items-start ">
      <div>
        <h4 className="text-sm font-medium">Collaboration Hub</h4>
        <h2 className="text-xl font-bold"> Discover Groups</h2>
        <p className="text-sm">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsum
          assumenda molestias quod! Corporis itaque sed dignissimos nemo, totam
          modi dolorem illum dolores neque sunt harum distinctio asperiores
          laboriosam voluptate eveniet!
        </p>
      </div>

      <button
        type="button"
        className="text-nowrap px-3 py-2 bg-blue-600 rounded text-white hover:bg-blue-500 transition-colors active:bg-blue-700 mt-auto"
        onClick={() => setIsCreateGroupDialogOpen(true)}
      >
        <Plus size={20} />
        Create Group
      </button>
      {isCreateGroupDialogOpen && (
        <CreateGroupDialog
          setIsCreateGroupDialogOpen={setIsCreateGroupDialogOpen}
        />
      )}
    </div>
  );
}

function CreateGroupDialog({
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

    },
    onError: () => {},
  });

  function handleSubmit(formData: FormData) {
    // const visibility = formData.get("visibility");
    // const name = formData.get("name");
    // const description = formData.get("description");
    // const maxParticipants = formData.get("maxParticipants");

    // console.log({visibility, name, description, maxParticipants });
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
