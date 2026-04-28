"use client";

import Loading from "@/src/components/Loading";
import { useFetchParticipants } from "@/src/queries/conversations";
import { useRouter } from "next/navigation";
import { use } from "react";
import MessageForm from "../../MessageForm";
import Messages from "./Messages";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconDotsVertical } from "@tabler/icons-react";

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
    <div className="grid grid-cols-[1fr_200px] h-screen">
      <section className="m-2 p-2 flex flex-col border rounded-lg border-gray-300 bg-gray-100 gap-2 h-[calc(100dvh-1rem)]">
        <div className="flex items-center justify-between flex-none border-b pb-2">
          <h1 className="px-2 font-bold text-lg">{name}</h1>

          <Menu id={parseInt(slug)} />
        </div>

        <div className="flex-1 min-h-0">
          <Messages id={parseInt(slug)} />
        </div>

        <div className="flex-none">
          <MessageForm conversationId={parseInt(slug)} recipientName={name} />
        </div>
      </section>
      <section>
        <Members id={slug} />
      </section>
    </div>
  );
}

function Members({ id }: { id: string }) {
  const { data, isLoading } = useFetchParticipants(parseInt(id));
  console.log(data);

  return (
    <div className="m-2 p-2 bg-gray-100 rounded-lg border border-gray-300">
      <h2 className="text-sm text-gray-400 px-2">
        {" "}
        {isLoading ? <Loading /> : "Members"}
      </h2>
      <ul>
        {data?.map((participant: any) => (
          <Member key={participant.id} name={participant.username} />
        ))}
      </ul>
    </div>
  );
}

function Member({ name }: { name: string }) {
  return (
    <li className=" text-sm py-1  px-2">
      <span>{name}</span>
    </li>
  );
}

// Menu
function Menu({ id }: { id: number }) {
  const router = useRouter();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant={"secondary"} size={"icon"} />}
      >
        <IconDotsVertical size={16} />
      </DropdownMenuTrigger>
      <DropdownMenuContent className={"rounded-md"}>
        <DropdownMenuItem
          onClick={() => router.push(`/chat/groups/${id}/settings`)}
          className={"rounded-sm"}
        >
          Setting
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
