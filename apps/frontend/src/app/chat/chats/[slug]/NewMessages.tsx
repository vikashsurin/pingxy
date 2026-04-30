import Loading from "@/src/components/Loading";
import { useMessages } from "@/src/hooks/api/conversations";
import { useUserStore } from "@/src/store/userStore";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Check, CheckCheck } from "lucide-react";
import { useRef } from "react";

export default function Messages({
  id,
  participant,
}: {
  id: number;
  participant: any;
}) {
  const {
    status,
    data,
    error,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useMessages(id);

  const users = useUserStore((state) => state.users);
  console.log({ users });

  const allRows = data ? [...data.pages].reverse().flatMap((d) => d.rows) : [];
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: allRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // just an initial estimate, will be overridden
    overscan: 5,
    // 👇 This is the key for dynamic heights
    measureElement:
      typeof window !== "undefined" &&
      navigator.userAgent.indexOf("Firefox") === -1
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  if (status === "pending") return <Loading />; // ← you were missing `return`
  if (status === "error") return <div>{error.message}</div>; // ← same

  return (
    <div ref={parentRef} className="h-full overflow-y-scroll">
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
          const message = allRows[virtualRow.index];

          return (
            <div
              key={virtualRow.key}
              // 👇 ref is required — this is what measureElement uses
              ref={rowVirtualizer.measureElement}
              data-index={virtualRow.index} // 👇 required for measureElement to identify the row
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                // 👇 Remove fixed height — let content define it
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {message ? (
                <Message
                  message={message}
                  sender={users[message.senderId]}
                  participant={participant}
                />
              ) : (
                <div>No messages yet</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Message({
  message,
  sender,
  participant,
}: {
  message: any;
  sender: any;
  participant: any;
}) {
  return (
    <div className="px-2 py-2 border-b">
      <div className="flex  items-center gap-2 ">
        <span className="font-bold text-xs underline ">
          {sender?.username}:{" "}
        </span>
        <span className="">{message.content}</span>
        <div className="flex ml-auto items-center gap-1">
          <span>
            <CheckMark
              messageId={message.id}
              lastReadMessageId={participant?.lastReadMessageId}
              lastDeliveredMessageId={participant?.lastDeliveredMessageId}
            />
          </span>
          <span className="text-xs text-gray-400  text-nowrap">
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </span>
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
