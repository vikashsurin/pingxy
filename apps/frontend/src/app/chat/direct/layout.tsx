"use client";

import { useConversations } from "@/src/hooks/api/useConversations";
import { useChatStore } from "@/src/store/chatStore";
import { useConversationStore } from "@/src/store/conversationStore";
import { useUserStore } from "@/src/store/userStore";
import Link from "next/link";
import { useState } from "react";
import Users from "./Users";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data, isLoading } = useConversations("direct");

  console.log("datarere", data);
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid grid-cols-[200px_1fr_200px]">
      <div className="flex h-screen flex-col border-r border-gray-300  bg-gray-100">
        <h2 className="px-3 py-2 bg-white flex font-bold border-b items-center gap-2">
          Recent
        </h2>
        <Conversations conversations={data.conversations} />
      </div>
      <div>{children}</div>

      <Users />
    </div>
  );
}

function Conversations({ conversations }: { conversations: any[] }) {
  const [selectedId, setSelected] = useState("");

  return conversations.map((conv) => (
    <div key={conv.id}>
      <ConversationItem
        id={conv.id}
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
  id: number;
  selectedId: string;
  setSelected: (id: string) => void;
}) => {
  const conv = useConversationStore((state) => state.conversations[Number(id)]);

  const meta = useConversationStore((state) => state.cps.get(Number(id)));

  const authUser = useChatStore((state) => state.authUser);
  const op = meta?.find((item) => item.uid !== authUser.id);

  console.log({ op });

  // TODO: Check this.
  const otherUsername = useUserStore((state) => {
    if (op) {
      return state.users[op?.uid ?? 0]?.userName;
    }
    return "";
  });

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
  cid: number;
  name: string;
  op?: { uid: number; pid: number };
  selectedId: string;
  setSelectedId: (id: string) => void;
}) => {
  console.log({ name });

  return (
    <Link
      href={`/chat/direct/${cid}?type=conversation&pid=${op?.pid}&uid=${op?.uid}&name=${name}`}
      id={cid.toString()}
      type="button"
      className={`block px-3 py-1 m-1 rounded
        ${Number(selectedId) === Number(cid) && "bg-gray-200 text-blue-600  border-gray-300"} hover:bg-gray-200 `}
      onClick={() => setSelectedId(cid.toString())}
    >
      {name}
    </Link>
  );
};
