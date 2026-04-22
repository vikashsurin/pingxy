"use client";

import Loading from "@/src/components/Loading";
import { useOnClickOutside } from "@/src/lib/utils/useOnClickOutside";
import { useFetchParticipants } from "@/src/queries/conversations";
import { EllipsisVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useRef, useState } from "react";
import Messages from "./Messages";
import MessageForm from "../../MessageForm";
// import GroupAdminPanel from "./GroupAdminPanel";

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

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("");

  console.log({ activeMenu });
  console.log({ isMenuOpen });
  return (
    <div className="grid grid-cols-[1fr_200px] h-screen">
      <section className="m-2 p-2  flex flex-col border rounded-lg border-gray-300 bg-gray-100 gap-2">
        <div className="flex items-center justify-between">
          <h1 className="px-2  font-bold text-lg">{name}</h1>
          <span
            className="relative hover:bg-gray-200 rounded-full p-1 active:bg-gray-300"
            onClick={() => setIsMenuOpen(true)}
          >
            <EllipsisVertical size={16} />
            {isMenuOpen && (
              <Menu
                setIsMenuOpen={setIsMenuOpen}
                setActiveMenu={setActiveMenu}
                conversationId={slug}
              />
            )}
          </span>
        </div>
        <div className="flex-1 min-h-0">
          <Messages id={parseInt(slug)} />
        </div>
        <div className="flex-none">
          <MessageForm conversationId={parseInt(slug)} />
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
function Menu({
  conversationId,
  setIsMenuOpen,
  setActiveMenu,
}: {
  conversationId: string;
  setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setActiveMenu: React.Dispatch<React.SetStateAction<string>>;
}) {
  const menuRef = useRef<HTMLUListElement>(null);
  useOnClickOutside(menuRef, () => setIsMenuOpen(false));

  const router = useRouter();
  return (
    <ul
      ref={menuRef}
      className="absolute top-full border right-0 bg-white border-gray-300 p-2 rounded-lg shadow-md min-w-40"
    >
      <MenuItem
        label="Settings"
        onClick={(e) => {
          e.stopPropagation();

          setIsMenuOpen(false);
          router.push(`/chat/groups/${conversationId}/settings`);
        }}
      />
    </ul>
  );
}

function MenuItem({
  label,
  onClick,
}: {
  label: string;
  onClick?: (e: React.MouseEvent) => void;
}) {
  return (
    <li className="hover:bg-gray-200  px-2 py-1 rounded" onClick={onClick}>
      {label}
    </li>
  );
}
