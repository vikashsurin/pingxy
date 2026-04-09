"use client";

import { conversationManager } from "@/lib/managers/conversationManager";
import { useChatStore } from "@/lib/store/chatStore";
import { useConversationStore } from "@/lib/store/conversationStore";
import { useUserStore } from "@/lib/store/userStore";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const fetchInitial = async () => {
      const data = await conversationManager.fetchConversations();
      console.log({ data });
    };
    fetchInitial();
  }, []);

  return (
    <div className="grid grid-cols-[200px_1fr]">
      <div className="flex flex-col border border-gray-300 rounded-lg my-2 p-2 gap-1 bg-gray-100">
        <Conversations />
      </div>
      <div>{children}</div>
    </div>
  );
}

function Conversations() {
  const [selectedId, setSelected] = useState("");
  const conversationIdx = useConversationStore(
    (state) => state.conversationIdx,
  );

  return Array.from(conversationIdx.values()).map((id) => (
    <div key={id}>
      <ConversationItem
        id={id}
        selectedId={selectedId}
        setSelected={setSelected}
      />
    </div>
  ));
}

const ConversationItem = ({
  id,
  selectedId,
  setSelected,
}: {
  id: string | number;
  selectedId: string;
  setSelected: (id: string) => void;
}) => {
  const conv = useConversationStore((state) => state.conversations[id]);

  const meta = useConversationStore((state) => state.cps.get(id));

  const authUser = useChatStore((state) => state.authUser);
  const op = meta?.find((item) => item.uid !== authUser.id);

  const otherUsername = useUserStore((state) => state.users[op?.uid]?.username);

  // 3. NOW you can do your conditional returns
  if (conv.type === "chat") return null;
  return (
    <Item
      cid={id}
      name={conv.name}
      selectedId={selectedId}
      setSelectedId={setSelected}
    />
  );
  //   if (!op?.uid) return <div>No Participant</div>;
  //   return (
  //     <Item
  //       cid={id}
  //       name={otherUsername}
  //       op={op}
  //       selectedId={selectedId}
  //       setSelectedId={setSelected}
  //     />
  //   );
};

const Item = ({
  cid,
  name,
  op,
  selectedId,
  setSelectedId,
}: {
  cid: string;
  name: string;
  op?: { uid: number; pid: number };
  selectedId: string;
  setSelectedId: (id: string) => void;
}) => {
  console.log({ name });

  return (
    <Link
      href={`/chat/groups/${cid}?type=group&name=${name}`}
      id={cid}
      type="button"
      className={`block px-3 py-1 rounded  
        ${selectedId === cid && "bg-blue-100 text-blue-600  border-blue-300"} hover:bg-blue-100 `}
      onClick={() => setSelectedId(cid)}
    >
      {name}
    </Link>
  );
};
