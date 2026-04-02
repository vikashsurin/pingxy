"use client";

import { useEffect } from "react";
import { initializeWebSocket } from "@/lib/socket/socket";

export default function Page() {
  useEffect(() => {
    const socket = initializeWebSocket();

    return () => {
      socket.close();
    };
  }, []);

  return <div>Chat page</div>;
}
