"use client";

import { useUserStore } from "@/src/store/userStore";
import Link from "next/link";
import { useState } from "react";
export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[200px_1fr]">
      <div>
        <Users />
      </div>
      <div>{children}</div>
    </div>
  );
}

function Users() {
  const users = useUserStore((state) => state.users);
  const userIndex = useUserStore((state) => state.userIndex);
  const userIds = Array.from(userIndex.values());

  const [selectedId, setSelected] = useState(userIds[0]);

  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col gap-1 bg-gray-100 rounded-lg border border-gray-300 p-2 my-2">
        {userIds.map((id) => (
          <li key={id}>
            <Link
              href={`/chat/users/${id}?type=user&name=${users[id]?.userName}`}
              className={`block px-3 py-1 rounded  
                ${selectedId === id && "bg-blue-100 text-blue-600  border-blue-300"} hover:bg-blue-100 `}
              onClick={() => setSelected(id)}
            >
              {users[id]?.userName}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
