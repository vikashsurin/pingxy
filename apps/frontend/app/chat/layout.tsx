"use client";

import { getAuthUser } from "@/lib/auth";
import { initializeWebSocket } from "@/lib/socket/socket";
import { useChatStore } from "@/lib/store/chatStore";
import { Group, MessagesSquare, Users as UsersIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selected, setSelected] = useState("");

  useEffect(() => {
    const socket = initializeWebSocket();

    const checkUser = async () => {
      try {
        const user = await getAuthUser();

        if (user) {
          useChatStore.setState({ authUser: user });
        }
      } catch (e) {
        console.error(e);
      }
    };

    checkUser();
    return () => {
      socket.close();
    };
  }, []);
  // const authUser =

  return (
    <section className="grid grid-cols-[200px_1fr]">
      <div className="grid gap-2">
        <Link
          href="/chat/users"
          className="flex  items-center gap-2 bg-gray-300 px-2 py-1 rounded"
          style={{
            color: selected === "users" ? "blue" : "black",
            fontWeight: selected ? "bold" : "normal",
          }}
          onClick={() => setSelected("users")}
        >
          {" "}
          <UsersIcon size={16} /> Users
        </Link>
        <Link
          href="/chat/chats"
          className="flex  items-center gap-2 bg-gray-300 px-2 py-1 rounded"
          style={{
            color: selected === "chats" ? "blue" : "black",
            fontWeight: selected ? "bold" : "normal",
          }}
          onClick={() => setSelected("chats")}
        >
          {" "}
          <MessagesSquare size={16} /> Chats
        </Link>
        <Link
          href="/chat/groups"
          className="flex  items-center gap-2 bg-gray-300 px-2 py-1 rounded"
          style={{
            color: selected === "groups" ? "blue" : "black",
            fontWeight: selected ? "bold" : "normal",
          }}
          onClick={() => setSelected("users")}
        >
          {" "}
          <Group size={16} /> Groups
        </Link>
      </div>

      <div>{children}</div>
    </section>
  );
}
