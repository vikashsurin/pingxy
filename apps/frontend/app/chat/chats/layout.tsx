"use client";

import { useConversations } from "@/lib/queries/conversations";
import { useChatStore } from "@/lib/store/chatStore";
import { useConversationStore } from "@/lib/store/conversationStore";
import { useUserStore } from "@/lib/store/userStore";
import Link from "next/link";
import { useState } from "react";
import Users from "./Users";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data, isLoading } = useConversations("direct");

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (data) {
    console.log({ dataQuery: data });
  }

  return (
    <div className="grid grid-cols-[200px_1fr_150px]">
      <div className="flex flex-col border border-gray-300 rounded-lg my-2 p-2 gap-1 bg-gray-100">
        <Conversations />
      </div>
      <div>{children}</div>

      <Users />
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
  if (conv.type === "group") return null;
  // return (
  //   <Item
  //     cid={id}
  //     name={conv.name}
  //     selectedId={selectedId}
  //     setSelectedId={setSelected}
  //   />
  // );
  if (!op?.uid) return <div>No Participant</div>;
  return (
    <>
      <Item
        cid={id}
        name={otherUsername}
        op={op}
        selectedId={selectedId}
        setSelectedId={setSelected}
      />
      {/* <div>kala</div> */}
    </>
  );
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
      href={`/chat/chats/${cid}?type=conversation&pid=${op?.pid}&uid=${op?.uid}&name=${name}`}
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
