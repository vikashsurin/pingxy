"use client";

import { conversationsApi } from "@/lib/api/conversation";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Check, CheckCheck } from "lucide-react";
import { useEffect, useLayoutEffect, useRef } from "react";

async function fetchServerPage(
  conversationId: number,
  limit: number,
  beforeId?: number,
) {
  const data = await conversationsApi.fetchMessages({
    conversationId,
    limit,
    before: beforeId,
  });

  const messages = data.entities.messages;

  return {
    rows: messages,
    nextCursor:
      messages.length === limit ? messages[messages.length - 1].id : undefined,
  };
}

export default function Messages({
  slug,
  participant,
  socket,
}: {
  slug: string;
  participant: any;
  socket?: any;
}) {
  const queryClient = useQueryClient();
  const queryKey = ["messages", slug];

  const {
    status,
    data,
    error,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey,
    queryFn: (ctx) => fetchServerPage(Number(slug), 20, ctx.pageParam),
    getNextPageParam: (lastGroup) => lastGroup.nextCursor,
    initialPageParam: undefined,
  });

  const allRows = data ? data.pages.flatMap((d) => d.rows) : [];
  const parentRef = useRef<HTMLDivElement>(null);
  const previousScrollHeightRef = useRef<number>(0);

  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? allRows.length + 1 : allRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 5,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  // ✅ Scroll-based trigger for loading older messages
  useEffect(() => {
    const el = parentRef.current;
    if (!el) return;

    const handleScroll = () => {
      if (el.scrollTop <= 100 && hasNextPage && !isFetchingNextPage) {
        previousScrollHeightRef.current = el.scrollHeight;
        fetchNextPage();
      }
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // ✅ Restore scroll position after old messages are prepended
  useLayoutEffect(() => {
    if (previousScrollHeightRef.current && parentRef.current) {
      const newScrollHeight = parentRef.current.scrollHeight;
      const diff = newScrollHeight - previousScrollHeightRef.current;
      if (diff > 0) {
        parentRef.current.scrollTop += diff;
        previousScrollHeightRef.current = 0;
      }
    }
  }, [allRows.length]);

  // ✅ Scroll to bottom on initial load
  useEffect(() => {
    if (status === "success" && allRows.length > 0) {
      rowVirtualizer.scrollToIndex(allRows.length - 1, { behavior: "auto" });
    }
  }, [status]);

  // ✅ Listen for new incoming messages via socket
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage: MessageType) => {
      if (newMessage.conversationId !== Number(slug)) return;

      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;
        const pages = [...old.pages];
        const lastPage = pages[pages.length - 1];
        pages[pages.length - 1] = {
          ...lastPage,
          rows: [...lastPage.rows, newMessage],
        };
        return { ...old, pages };
      });

      // Auto-scroll to bottom if user is already near the bottom
      const el = parentRef.current;
      if (el) {
        const isNearBottom =
          el.scrollHeight - el.scrollTop - el.clientHeight < 150;
        if (isNearBottom) {
          setTimeout(() => {
            rowVirtualizer.scrollToIndex(allRows.length, {
              behavior: "smooth",
            });
          }, 50);
        }
      }
    };

    socket.on("new_message", handleNewMessage);
    return () => socket.off("new_message", handleNewMessage);
  }, [socket, slug, allRows.length]);

  return (
    <div>
      {status === "pending" ? (
        <p>Loading...</p>
      ) : status === "error" ? (
        <p>Error: {(error as Error).message}</p>
      ) : (
        <div
          ref={parentRef}
          style={{ height: `500px`, width: `100%`, overflow: "auto" }}
        >
          {/* ✅ Loader shown at the top outside the virtualizer */}
          {isFetchingNextPage && (
            <div className="flex justify-center py-2 text-sm text-gray-400">
              Loading older messages...
            </div>
          )}

          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {virtualItems.map((virtualRow) => {
              const post = allRows[virtualRow.index];

              return (
                <div
                  key={virtualRow.index}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {post ? (
                    <Message post={post} participant={participant} />
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

type MessageType = {
  clientMessageId: string;
  content: string;
  conversationId: number;
  createdAt: Date;
  id: number;
  senderId: number;
};

function Message({
  post,
  participant,
}: {
  post: MessageType;
  participant: any;
}) {
  return (
    <div className="border p-2 w-48 flex">
      <div className="flex flex-col w-full">
        <p>{post.id}</p>
        <p>{post.content}</p>
        <div className="text-xs flex justify-between items-center">
          <span>{new Date(post.createdAt).toLocaleTimeString()}</span>
          <CheckMark
            messageId={post.id}
            lastReadMessageId={participant?.lastReadMessageId}
            lastDeliveredMessageId={participant?.lastDeliveredMessageId}
          />
        </div>
      </div>
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
      return <CheckCheck size={12} className="text-gray-500" />;
    default:
      return <Check size={12} className="text-gray-500" />;
  }
}
