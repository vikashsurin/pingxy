"use client";

import { conversationService } from "@/src/services/conversationService";
import { use, useEffect } from "react";
import MessageForm from "../../MessageForm";
import Messages from '../../Messages';
import Members from "./Members";
import Menu from "./Menu";

export default function Page({
  params,
  searchParams,
}: {
  params: Promise<{ conversationId: string }>;
  searchParams: Promise<{
    type?: string;
    name?: string;
    [key: string]: string | string[] | undefined;
  }>;
}) {
  const { conversationId } = use(params);
  const { name } = use(searchParams);

  useEffect(() => {
    conversationService.subscribe({ conversationId: Number(conversationId) })
  });

  return (
    <div className="grid grid-cols-[1fr_200px] h-screen">
      <section className=" flex flex-col border-r  border-gray-300  gap-2 h-[calc(100dvh-1rem)]">

        <div className="flex bg-white items-center justify-between flex-none border-b ">
          <h1 className="px-3 py-2 font-bold ">{name}</h1>
          <Menu id={parseInt(conversationId)} />
        </div>

        <div className="flex-1 min-h-0">
          <Messages id={parseInt(conversationId)} />
        </div>

        <div className="flex-none">
          <MessageForm
            conversationId={parseInt(conversationId)}
            recipientName={name}
          />
        </div>
      </section>
      <section>
        <Members id={conversationId} />
      </section>
    </div>
  );
}
