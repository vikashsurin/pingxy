"use client";

import { useConversations } from "@/src/hooks/api/conversations";
import { useState } from "react";
import GroupItemCard from "./GroupItemCard";
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
    <div className="flex flex-wrap gap-3">
      {data.conversations?.map((conv: any) => (
        <GroupItemCard
          key={conv.id}
          id={conv.id}
          creator={conv.createdBy}
        />
      ))}
    </div>
  );
}
