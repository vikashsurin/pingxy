"use client";

import React from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className="rounded-md aspect-square shadow-sm hover:shadow-lg transition-shadow" onClick={() => handleClick()}>
      <CardHeader>
        {conv.isPrivate && <InviteOnly />}
        <CardTitle className="font-bold">{conv.name} </CardTitle>
        <CardDescription>{conv.description}</CardDescription>
      </CardHeader>
    </Card>
  );
};


function InviteOnly() {
  return (
    <span className="mb-1 text-xs w-max px-1.5 py-0.5 rounded-xs  bg-red-100 text-red-500 font-medium">
      INVITE ONLY
    </span>
  );
}
