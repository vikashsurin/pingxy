"use client";

import { conversationService } from "@/src/services/conversationService";
import { useChatStore } from "@/src/store/chatStore";
import { useConversationStore } from "@/src/store/conversationStore";
import { useUserStore } from "@/src/store/userStore";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function Users() {
  const router = useRouter();
  const authUser = useChatStore((state) => state.authUser);
  const users = useUserStore((state) => state.users);
  const userIndex = useUserStore((state) => state.userIndex);
  const cps = useConversationStore((state) => state.cps); // ✅ reactive

  const userIds = useMemo(() => Array.from(userIndex.values()), [userIndex]);
  const [selectedId, setSelected] = useState<string | undefined>(undefined);

  async function handleClick(userId: string) {
    // setSelected(userId);
    console.log("userId", userId);
    const data = await conversationService.findConversation({
      userId: Number(userId),
    });

    if (data) {
      const meta = cps.get(data.id);
      const op = meta?.find((item) => item.uid !== authUser.id);
      const otherUsername = users[op?.uid]?.userName;

      console.log("{ op, otherUsername , userId}", {
        op,
        otherUsername,
        authuserId: authUser.id,
      });

      // ✅ navigate directly, no useEffect needed
      router.push(
        `/chat/direct/${data.id}?type=conversation&pid=${op?.pid}&uid=${op?.uid}&name=${otherUsername}`,
      );
    } else {
      router.push(
        `/chat/direct/${userId}?type=newConversation&uid=${userId}&name=${users[userId]?.userName}`,
      );
      console.log(
        "No existing conversation — handle new conversation flow here",
      );
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col gap-1 bg-gray-100 rounded-lg border border-gray-300 p-2 my-2">
        <h2 className="px-2 flex items-center gap-2">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-sky-500" />
          </span>
          <span className="text-sm font-bold">Online</span>
        </h2>
        {userIds.map((id) => (
          <li key={id}>
            <button
              type="button"
              className={`block px-3 py-1 rounded hover:bg-blue-100
                ${selectedId === id ? "bg-blue-100 text-blue-600 border-blue-300" : ""}`}
              onClick={() => handleClick(id)}
            >
              {users[id]?.userName}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
