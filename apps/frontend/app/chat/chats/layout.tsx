"use client";

import { conversationManager } from "@/lib/managers/conversationManager";
import { useChatStore } from "@/lib/store/chatStore";
import { useConversationStore } from "@/lib/store/conversationStore";
import { useUserStore } from "@/lib/store/userStore";
import Link from "next/link";
import { useEffect } from "react";

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
      <div>
        <Conversations />
      </div>
      <div>{children}</div>
    </div>
  );
}

function Conversations() {
  const conversationIdx = useConversationStore(
    (state) => state.conversationIdx,
  );

  return Array.from(conversationIdx.values()).map((id) => (
    <div key={id}>
      <ConversationItem id={id} />
    </div>
  ));
}

const ConversationItem = ({ id }) => {
  const conv = useConversationStore((state) => state.conversations[id]);

  const meta = useConversationStore((state) => state.cps.get(id));

  const authUser = useChatStore((state) => state.authUser);
  const op = meta?.find((item) => item.uid !== authUser.id);

  const otherUsername = useUserStore((state) => state.users[op?.uid]?.username);

  // 3. NOW you can do your conditional returns
  if (conv.type === "group")
    return (
      <div>
        <Item cid={id} name={conv.name} />
      </div>
    );
  if (!op?.uid) return <div>No Participant</div>;

  return <div>{<Item cid={id} name={otherUsername} op={op} />}</div>;
};

const Item = ({
  cid,
  name,
  op,
}: {
  cid: string;
  name: string;
  op?: { uid: number; pid: number };
}) => {
  console.log({ name });
  // const [selectedId, setSelected] = useState("");

  return (
    <Link
      href={`/chat/chats/${cid}?type=conversation&pid=${op?.pid}&uid=${op?.uid}&name=${name}`}
      id={cid}
      type="button"
      // style={{
      //   color: selectedId === cid ? "red" : "black",
      //   backgroundColor: selectedId === cid ? "yellow" : "white",
      // }}
      className="border  px-2 py-1  hover:bg-gray-400"
      // onClick={() => setSelected(cid)}
    >
      {name}
    </Link>
  );
};
