"use client";

import { conversationsApi } from "@/lib/api/conversation";
import queryClient from "@/lib/queryClient";
import { useChatStore } from "@/lib/store/chatStore";
import { useConversationStore } from "@/lib/store/conversationStore";
import { formatTime } from "@/lib/utils/date";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Check, CheckCheck } from "lucide-react";
import { use, useEffect } from "react";
import MessageForm from "../../MessageForm";

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
  console.log({ participant, type, pid, uid, name });
  // useEffect(() => {});

  console.log("Current User ID (slug):", slug, type);

  return (
    <QueryClientProvider client={queryClient}>
      <Chat slug={slug} participant={participant} />
      <MessageForm
        conversationId={Number(slug)}
        recipientId={Number(uid)}
        recipientName={name}
      />
    </QueryClientProvider>
  );
}

function Chat({ slug, participant }: { slug: string; participant: any }) {
  console.log({ p: participant });
  const { isPending, error, data, isFetching } = useQuery({
    queryKey: ["messages", String(slug)],
    queryFn: async () => conversationsApi.fetchMessages(Number(slug)),
  });

  const authUser = useChatStore((state) => state.authUser);

  useEffect(() => {
    if (data !== undefined) {
      console.log({ data });
    }
  }, [data]);

  if (isFetching) return <p>Fetching...</p>;
  if (isPending && !data) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="bg-amber-400 p-4">
      {data.entities.messages.map((message) => {
        const fromMe = message.senderId === authUser.id;
        const id = message.id;
        const content = message.content;
        return (
          <div
            key={id}
            className={`border p-2 w-48 flex ${fromMe ? "justify-self-end bg-blue-100" : "justify-self-start bg-white"}`}
          >
            <div className="flex flex-col  w-full">
              <p>{content}</p>
              <div className="text-xs flex justify-between items-center">
                <span> {formatTime(message.createdAt)}</span>
                <span>
                  <CheckMark
                    messageId={id}
                    lastReadMessageId={participant?.lastReadMessageId}
                    lastDeliveredMessageId={participant?.lastDeliveredMessageId}
                  />
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CheckMark({
  messageId,
  lastReadMessageId,
  lastDeliveredMessageId,
}: {
  messageId: number;
  lastReadMessageId: number;
  lastDeliveredMessageId: number;
}) {
  switch (true) {
    case lastReadMessageId >= messageId:
      return <CheckCheck size={12} className="text-blue-500" />;
    case lastDeliveredMessageId >= messageId:
      return (
        <div>
          <CheckCheck size={12} className="text-gray-500" />
        </div>
      );
    default:
      return (
        <div>
          <Check size={12} className="text-gray-500" />
        </div>
      );
  }
}
