"use client";

import { useConversationStore } from "@/src/store/conversationStore";
import { use } from "react";
import MessageForm from "../../MessageForm";
import Messages from "../../Messages";

export default function Page({
  params,
  searchParams,
}: {
  params: Promise<{ conversationId: string }>;
  searchParams: Promise<{
    [type: string]: string | string[] | undefined;
    pid: string;
    uid: string;
    name: string;
  }>;
}) {
  const { conversationId } = use(params);
  const { type, pid, uid, name } = use(searchParams);

  const participant = useConversationStore(
    (state) => state.participants[Number(pid)],
  );

  return (
    <div className="grid  h-screen">
      <section className=" flex w-full flex-col   border-gray-300  h-[calc(100dvh-1rem)]">
        <div className="flex items-center justify-between bg-white border-b">
          <h2 className="px-3 py-2 font-bold">{name}</h2>
          {/* Menu here */}
        </div>

        <div className="flex-1 min-h-0">
          <Messages id={Number(conversationId)} />
        </div>

        <div className="flex-none">
          <MessageForm
            conversationId={Number(conversationId)}
            recipientId={Number(uid)}
            recipientName={name}
          />
        </div>
      </section>
      <section>{/* <Members id={Number(conversationId)} /> */}</section>
    </div>
    // <div className="flex flex-col m-2  p-2 border border-gray-300 bg-gray-100 rounded-lg">
    //   {type === "conversation" && (
    //     <div>
    //       <div className="flex-1 min-h-0">
    //         <NewMessages id={Number(conversationId)} />
    //       </div>
    //       {/* <Messages conversationId={conversationId} participant={participant} /> */}
    //       <MessageForm
    //         conversationId={Number(conversationId)}
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
