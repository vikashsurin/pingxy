"use client";

import { authApi } from "@/src/lib/api/auth";

import { initializeWebSocket } from "@/src/lib/socket/socket";
import { useChatStore } from "@/src/store/chatStore";
import {
  Group,
  MessagesSquare,
  Settings,
  ShieldQuestionMark,
  Users as UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import SettingsPage from "./_components/SettingsPage";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const socket = initializeWebSocket();

    const checkUser = async () => {
      try {
        const user = await authApi.getAuthUser();

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

  return (
    <section className="grid grid-cols-[200px_1fr] h-screen ">
      <div className="flex flex-col  bg-gray-100 gap-1  p-2 m-2 rounded-lg border border-slate-300 ">
        {/* <CustomLink href="/chat/users" type="users" /> */}
        <CustomLink href="/chat/chats" type="chats" />
        <CustomLink href="/chat/groups" type="groups" />
        <div aria-label="separator" className="border-t border-gray-400"></div>
        <div className="flex flex-col gap-1 mt-auto">
          <SidebarItem
            label="Settings"
            icon={<Settings size={16} />}
            onclick={() => setIsSettingsOpen(!isSettingsOpen)}
          />
          {isSettingsOpen && (
            <SettingsPage setIsSettingsOpen={setIsSettingsOpen} />
          )}
          <SidebarItem label="Help" icon={<ShieldQuestionMark size={16} />} />
        </div>
        <div className="flex gap-2 items-center w-full px-3 py-1 relative"></div>
      </div>

      <div>{children}</div>
    </section>
  );
}

function CustomLink({ href, type }: { href: string; type: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2  px-3 py-1 rounded hover:bg-gray-700 hover:text-white transition-colors"
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

function SidebarItem({
  href,
  label,
  icon,
  onclick,
}: {
  href?: string;
  label: string;
  icon: React.ReactNode;
  onclick?: () => void;
}) {
  return (
    <button
      type="button"
      className="flex items-center gap-2  px-3 py-1 rounded hover:bg-gray-700 hover:text-white transition-colors w-full"
      onClick={onclick}
    >
      {icon}
      {label}
    </button>
  );
}
