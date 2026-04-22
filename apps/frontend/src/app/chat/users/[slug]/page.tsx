"use client";

import queryClient from "@/src/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { CircleUserRound } from "lucide-react";
import { use } from "react";
import MessageForm from "../../MessageForm";

export default function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    [type: string]: string | string[] | undefined;
    name: string;
  }>;
}) {
  const { slug } = use(params);
  const { type, name } = use(searchParams);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="p-2  m-2 bg-gray-100 border border-gray-300 rounded-lg">
        <h1 className=" flex  items-center gap-2">
          {" "}
          <span className="bg-gray-100 p-0.5 text-gray-300 rounded-full border border-gray-300">
            <CircleUserRound size={16} />
          </span>
          {name}
        </h1>
        <p className="p-5 flex items-center justify-center text-gray-400">
          Start a new conversation
        </p>
        <MessageForm recipientId={Number(slug)} recipientName={name} />
      </div>
    </QueryClientProvider>
  );
}
