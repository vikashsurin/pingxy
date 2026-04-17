"use client";

import { EllipsisVertical } from "lucide-react";
import { use, useState } from "react";
import GroupAdminPanel from "./GroupAdminPanel";

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
    <div className="grid grid-cols-[1fr_200px]">
      {activeMenu === "admin" && (
        <GroupAdminPanel setActiveMenu={setActiveMenu} conversationId={slug} />
      )}
      <div
        id={slug}
        className="m-2 border flex items-center justify-between gap-2 p-2 rounded-lg border-gray-300 bg-gray-100 h-max"
      >
        <h1 className="px-2  font-bold text-lg">{name}</h1>
        <span
          className="relative hover:bg-gray-200 rounded-full p-1 active:bg-gray-300"
          onClick={() => setIsMenuOpen(true)}
        >
          <EllipsisVertical size={16} />
          {isMenuOpen && (
            <Menu setIsMenuOpen={setIsMenuOpen} setActiveMenu={setActiveMenu} />
          )}
        </span>
      </div>
      <Members />
    </div>
  );
}

function Members() {
  return (
    <div className="m-2 p-2 bg-gray-100 rounded-lg border border-gray-300">
      <h2 className="text-sm text-gray-400">Members</h2>
      <ul>
        <Member name="John Doe" />
        <Member name="Jane Doe" />
        <Member name="John Doe" />
        <Member name="Jane Doe" />
        <Member name="John Doe" />
        <Member name="Jane Doe" />
        <Member name="John Doe" />
        <Member name="Jane Doe" />
      </ul>
    </div>
  );
}

function Member({ name }: { name: string }) {
  return (
    <li className=" text-sm py-1">
      <span>{name}</span>
    </li>
  );
}

// Menu

function Menu({
  setIsMenuOpen,
  setActiveMenu,
}: {
  setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setActiveMenu: React.Dispatch<React.SetStateAction<string>>;
}) {
  return (
    <ul className="absolute top-full border right-0 bg-white border-gray-300 p-2 rounded-lg shadow-md min-w-40">
      <MenuItem
        label="Admin"
        onClick={(e) => {
          e.stopPropagation();

          setIsMenuOpen(false);
          setActiveMenu("admin");
        }}
      />
      <MenuItem label="Settings" />
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
