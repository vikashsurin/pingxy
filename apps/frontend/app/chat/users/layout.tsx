"use client";

import { useUserStore } from "@/lib/store/userStore";
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
      <ul className="border p-2">
        {userIds.map((id) => (
          <li key={id}>
            <Link
              href={`/chat/users/${id}?type=user`}
              className="block border px-2 py-1"
              style={{
                color: selectedId === id ? "red" : "black",
                backgroundColor: selectedId === id ? "yellow" : "white",
              }}
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
