"use client";

import Loading from "@/src/components/Loading";
import { useFetchInvite } from "@/src/queries/conversationInvite";
import { use } from "react";

type Params = {
  id: string;
};

export default function Invite({ params }: { params: Promise<Params> }) {
  const { id } = use(params);

  const { data, isLoading } = useFetchInvite(parseInt(id));

  if (isLoading) return <Loading />;

  return (
    <div className="p-4 m-2 border border-gray-300 bg-gray-100 rounded-lg">
      <h1>Invite Code {id}</h1>
      <div className="flex flex-col">
        <span>ConversationId: {data.conversationId}</span>
        <span>Invite Code: {data.inviteCode} </span>
        <span>MaxUses : {data.maxUses}</span>
        <span>Requires Approval: {data.requiresApproval}</span>
        <span>Uses Count: {data.usesCount}</span>
      </div>
    </div>
  );
}
