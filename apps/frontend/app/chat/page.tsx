"use client";

import { initializeWebSocket } from "@/lib/socket/socket";
import { useEffect, useState } from "react";
import Users from "./(sidebar)/Users";
import Groups from "./(sidebar)/Groups";
import RecentChats from "./(sidebar)/RecentChats";

export default function Page() {
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const socket = initializeWebSocket();

    return () => {
      socket.close();
    };
  }, []);

  return (
    <div>
      <div>Chat Page</div>
      <div className="grid grid-cols-7">
        <div className="flex flex-col col-span-2 border">
          <SidebarItem label="Users" callback={setSelected} />
          <SidebarItem label="Groups" callback={setSelected} />
          <SidebarItem label="Recent-Chats" callback={setSelected} />
        </div>
        <div className="col-span-5 border">
          <Visible type={selected} />
        </div>
      </div>
    </div>
  );
}

function SidebarItem({
  label,
  callback,
}: {
  label: string;
  callback: (value: string) => void;
}) {
  return (
    <button
      type="button"
      className="border px-3 py-2  hover:bg-gray-300"
      onClick={() => callback(label)}
    >
      {label}
    </button>
  );
}

function Visible({ type }: { type: string | null }) {
  switch (type) {
    case "Users":
      return <Users />;
    case "Groups":
      return <Groups />;
    case "Recent-Chats":
      return <RecentChats />;
    default:
      return (
        <div className="flex items-center justify-center h-full text-gray-400">
          Select an item from the sidebar to view details.
        </div>
      );
  }
}
