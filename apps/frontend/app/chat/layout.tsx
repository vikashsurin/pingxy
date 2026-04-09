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
    <section className="grid grid-cols-[200px_1fr] ">
      <div className="flex flex-col  bg-gray-100 gap-1  p-2 m-2 rounded-lg border border-slate-300 ">
        {/* <CustomLink href="/chat/users" type="users" /> */}
        <CustomLink href="/chat/chats" type="chats" />
        <CustomLink href="/chat/groups" type="groups" />
      </div>

      <div>{children}</div>
    </section>
  );
}

function CustomLink({ href, type }: { href: string; type: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded hover:bg-gray-700 hover:text-white transition-colors"
    >
      {type === "users" ? (
        <UsersIcon size={14} />
      ) : type === "chats" ? (
        <MessagesSquare size={14} />
      ) : (
        <Group size={14} />
      )}
      {type}
    </Link>
  );
}
