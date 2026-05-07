"use client";

import { useConversationStore } from "@/src/store/conversationStore";
import { use } from "react";
import MessageForm from "../../MessageForm";
import NewMessages from "./NewMessages";
import Members from "../../group/[conversationId]/Members";

export default function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    [type: string]: string | string[] | undefined;
    pid: string;
    uid: string;
    name: string;
  }>;
}) {
  const { slug } = use(params);
  const { type, pid, uid, name } = use(searchParams);

  const participant = useConversationStore(
    (state) => state.participants[Number(pid)],
  );

  return (
    <div className="grid grid-cols-[1fr_200px] h-screen">
      <section className="m-2 p-2 flex flex-col border rounded-lg border-gray-300 bg-gray-100 gap-2 h-[calc(100dvh-1rem)]">
        <div className="flex items-center justify-between flex-none border-b pb-2">
          <h1 className="px-2 font-bold text-lg">{name}</h1>
          {/* Menu here */}
        </div>

        <div className="flex-1 min-h-0">
          <NewMessages id={Number(slug)} />
        </div>

        <div className="flex-none">
          <MessageForm
            conversationId={Number(slug)}
            recipientId={Number(uid)}
            recipientName={name}
          />
        </div>
      </section>
      <section>{/* <Members id={Number(slug)} /> */}</section>
    </div>
    // <div className="flex flex-col m-2  p-2 border border-gray-300 bg-gray-100 rounded-lg">
    //   {type === "conversation" && (
    //     <div>
    //       <div className="flex-1 min-h-0">
    //         <NewMessages id={Number(slug)} />
    //       </div>
    //       {/* <Messages slug={slug} participant={participant} /> */}
    //       <MessageForm
    //         conversationId={Number(slug)}
    //         recipientId={Number(uid)}
    //         recipientName={name}
    //       />
    //     </div>
    //   )}

    //   {type === "newConversation" && (
    //     <div>
    //       <p>Start a new conversations</p>
    //       <MessageForm recipientId={Number(uid)} recipientName={name} />
    //     </div>
    //   )}
    // </div>
  );
}
