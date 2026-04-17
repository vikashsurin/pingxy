import { authApi } from "@/lib/api/auth";
import { useChatStore } from "@/lib/store/chatStore";
import { useMutation } from "@tanstack/react-query";
import { LogOut, X } from "lucide-react";
import { useState } from "react";
import SettingItemView from "./SettingItemView";

export default function SettingsPage({
  setIsSettingsOpen,
}: {
  setIsSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [selected, setSelected] = useState("");

  return (
    <div className=" border border-gray-300 shadow-2xl fixed inset-30 bg-gray-50 rounded-lg overflow-hidden">
      <CloseSettingsButton setIsSettingsOpen={setIsSettingsOpen} />
      <div className="grid grid-cols-[200px_1fr] h-full">
        <div className="h-full  p-2 border-r border-gray-400">
          <h2 className="font-bold  m-2">Settings</h2>
          <section className="flex flex-col gap-1 ">
            <Item
              label="Profile"
              unique="profile"
              selected={selected}
              onclick={() => setSelected("profile")}
            />
            <LogoutButton />
          </section>
        </div>
        <section className="bg-gray-200">
          {selected === "profile" && <SettingItemView selected={selected} />}
        </section>
      </div>
    </div>
  );
}

function CloseSettingsButton({
  setIsSettingsOpen,
}: {
  setIsSettingsOpen: (arg: boolean) => void;
}) {
  return (
    <div
      className="absolute top-2 right-2 cursor-pointer flex items-center gap-2"
      title="Close the settings"
    >
      <div
        onClick={() => setIsSettingsOpen(false)}
        className=" rounded-xs p-1 hover:bg-gray-700 hover:text-white transition-colors"
      >
        <X size={16} />
      </div>
    </div>
  );
}

function LogoutButton() {
  const { mutate, isPending } = useMutation({
    mutationFn: async () => authApi.logout(),
    onSuccess: () => {
      window.location.href = "/auth/login";
      useChatStore.setState({ authUser: null });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  function handleLogout() {
    mutate();
  }

  return (
    <button
      title="logout"
      type="button"
      className=" px-2 py-1  font-medium text-red-600 border-2 border-red-400 rounded-md flex gap-2 items-center  hover:bg-red-600 hover:text-white transition-colors active:bg-red-700 w-full justify-between"
      onClick={handleLogout}
      disabled={isPending}
    >
      {isPending ? "Logging out..." : "Logout"}
      <LogOut size={14} />
    </button>
  );
}

function Item({
  label,
  unique,
  selected,
  onclick,
}: {
  label: string;
  unique: string;
  selected: string;
  onclick: () => void;
}) {
  return (
    <button
      type="button"
      className={`px-2 py-1  rounded-md flex gap-2 items-center  transition-colors  w-full justify-between hover:bg-gray-700 hover:text-white ${selected === unique && "bg-gray-700 text-white"}`}
      onClick={onclick}
    >
      {label}
    </button>
  );
}
