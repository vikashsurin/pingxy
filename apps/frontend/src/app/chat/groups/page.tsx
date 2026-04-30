"use client";

import { useConversations } from "@/src/hooks/api/conversations";
import { useConversationStore } from "@/src/store/conversationStore";

import { useRouter } from "next/navigation";
import { useState } from "react";
import GroupPageHeader from "./GroupPageHeader";
import JoinViaInvite from "./JoinViaInvite";
import SearchGroup from "./SearchGroup";

export default function Page() {
  return (
    <div className="m-2  flex flex-col gap-6  p-4 rounded-lg border-gray-300 ">
      <GroupPageHeader />
      <JoinViaInvite />
      <SearchGroup />
      <Groups />
    </div>
  );
}

function Groups() {
  const [selectedId, setSelected] = useState("");

  const { data, isLoading, error } = useConversations("group");
  if (isLoading) {
    return (
      <div className="h-96 rounded-md overflow-y-auto flex items-center justify-center bg-gray-100">
        <span className="loading-dots">Loading</span>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (data) {
  }

  return (
    <div className="grid grid-cols-4 gap-2">
      {data.conversations?.map((conv: any) => (
        <GroupItemCard
          key={conv.id}
          id={conv.id}
          selectedId={selectedId}
          setSelected={setSelected}
        />
      ))}
    </div>
  );
}

const GroupItemCard = ({
  id,
  selectedId,
  setSelected,
}: {
  id: string;
  selectedId: string;
  setSelected: (id: string) => void;
}) => {
  const router = useRouter();
  const conv = useConversationStore((state) => state.conversations[id]);

  function handleClick() {
    router.push(`/chat/groups/${id}?name=${conv.name}`);
    setSelected(String(id));
  }
  return (
    <div
      className="border flex flex-col gap-2 border-gray-300 p-4 rounded  aspect-square bg-gray-100 hover:shadow-xl transition-shadow duration-200 ease-in-out hover:bg-gray-50 hover:border-gray-400"
      onClick={() => handleClick()}
    >
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-xl ">{conv.name}</h4>
        <p className="text-xs text-gray-400">
          {conv.isPrivate ? "Private" : "Public"}
        </p>
      </div>
      <p className="text-gray-500 text-sm">
        {conv.description || "No description"}
      </p>

      <div className="flex justify-between items-baseline mt-auto">
        <p className="text-sm">20 Active Now</p>
      </div>
    </div>
  );
};
