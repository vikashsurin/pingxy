"use client";

import queryClient from "@/lib/queryClient";
import { useConversationStore } from "@/lib/store/conversationStore";
import { QueryClientProvider } from "@tanstack/react-query";
import { use } from "react";
import MessageForm from "../../MessageForm";
import Messages from "./Messages";

export default function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    [type: string]: string | string[] | undefined;
    pid: string;
    uid: string;
    name: string;
  }>;
}) {
  const { slug } = use(params);
  const { type, pid, uid, name } = use(searchParams);

  const participant = useConversationStore(
    (state) => state.participants[Number(pid)],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col m-2  p-2 border border-gray-300 bg-gray-100 rounded-lg">
        {/* <Messages slug={slug} participant={participant} /> */}
        <MessageForm
          conversationId={Number(slug)}
          recipientId={Number(uid)}
          recipientName={name}
        />
      </div>
    </QueryClientProvider>
  );
}
