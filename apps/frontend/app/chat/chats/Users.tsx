"use client";

import { useUserStore } from "@/lib/store/userStore";
import Link from "next/link";
import { useState } from "react";

export default function Users() {
  const users = useUserStore((state) => state.users);
  const userIndex = useUserStore((state) => state.userIndex);
  const userIds = Array.from(userIndex.values());

  const [selectedId, setSelected] = useState(userIds[0]);

  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col gap-1 bg-gray-100 rounded-lg border border-gray-300 p-2 my-2">
        <h2 className="px-2 flex items-center gap-2">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex size-2 rounded-full bg-sky-500"></span>
          </span>
          <span className="text-sm font-bold">Online</span>
        </h2>
        {userIds.map((id) => (
          <li key={id}>
            <Link
              href={`/chat/chats/${id}?type=user&name=${users[id]?.username}`}
              className={`block px-3 py-1 rounded  
                  ${selectedId === id && "bg-blue-100 text-blue-600  border-blue-300"} hover:bg-blue-100 `}
              onClick={() => setSelected(id)}
            >
              {users[id]?.username}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
