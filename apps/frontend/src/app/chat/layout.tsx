"use client";

import { Button } from "@/components/ui/button";
import { authApi } from "@/src/lib/api/auth";
import { initializeWebSocket } from "@/src/socket/socket";
import { useChatStore } from "@/src/store/chatStore";
import { Group, MessagesSquare, Users as UsersIcon } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import SettingsPage from "./[settings]/SettingsPage";
import { IconHelp } from "@tabler/icons-react";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        <CustomLink href="/chat/direct" type="direct" />
        <CustomLink href="/chat/group" type="group" />
        <div aria-label="separator" className="border-t border-gray-400"></div>
        <div className="flex flex-col gap-1 mt-auto">
          <SettingsPage />
          <Button
            variant={"secondary"}
            className="flex justify-start hover:bg-gray-200"
          >
            {" "}
            <IconHelp size={20} />
            Help
          </Button>
          {/*<SidebarItem label="Help" icon={<ShieldQuestionMark size={16} />} />*/}
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
      ) : type === "direct" ? (
        <MessagesSquare size={14} />
      ) : (
        <Group size={14} />
      )}
      {type}
    </Link>
  );
}
