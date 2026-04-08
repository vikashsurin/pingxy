"use client";

import { conversationsApi } from "@/lib/api/conversation";
import { useChatStore } from "@/lib/store/chatStore";
import { formatTime } from "@/lib/utils/date";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { Check, CheckCheck } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";

async function fetchServerPage(
  convId: number,
  limit: number,
  offset: number = 0,
): Promise<{ rows: Array<string>; nextOffset: number }> {
  //   const rows = new Array(limit)
  //     .fill(0)
  //     .map((_, i) => `Async loaded row #${i + offset * limit}`);

  const data = await conversationsApi.fetchMessages(convId);
  const { messages, attachments } = data.entities;
  console.log({ dataFrom: data });

  const rows = messages;

  await new Promise((r) => setTimeout(r, 500));

  return { rows, nextOffset: offset + 1 };
}

export default function Messages({
  slug,
  participant,
}: {
  slug: string;
  participant: any;
}) {
  const {
    status,
    data,
    error,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["projects"],
    queryFn: (ctx) => fetchServerPage(Number(slug), 10, ctx.pageParam),
    getNextPageParam: (lastGroup) => lastGroup.nextOffset,
    initialPageParam: 0,
  });

  //   const { isPending, error, data, isFetching } = useQuery({
  //     queryKey: ["messages", String(slug)],
  //     queryFn: async () => conversationsApi.fetchMessages(Number(slug)),
  //   });

  const authUser = useChatStore((state) => state.authUser);

  if (isFetching) return <p>Fetching...</p>;
  //   if (isPending && !data) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="bg-amber-400 p-4">
      {/* {data.entities.messages.map((message) => {
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
      })} */}
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
