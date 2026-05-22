import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger
} from "@/components/ui/dialog";
import { authApi } from "@/src/lib/api/authApi";
import { useChatStore } from "@/src/store/chatStore";
import { IconLogout, IconSettings, IconUserCog, IconUserScreen } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import Profile from "./Profile";
import { Account } from "./Account";

export default function SettingsPage() {
  const [selectedNavItem, setSelectedNavItem] = useState<string>("profile");

  return (
    <Dialog>
      <DialogTrigger
        className={"flex gap-2 items-center hover:bg-gray-200 p-2 rounded-md  "}
      >
        <IconSettings size={20} /> Settings
      </DialogTrigger>

      <DialogContent className="rounded-xl min-h-[80vh] min-w-[80vw] max-w-[80vw] flex gap-0 flex-col p-0 overflow-hidden">
        <div className="grid grid-cols-[200px_1fr] flex-1 overflow-hidden">
          <nav className="flex flex-col p-2 rounded-none bg-gray-200">
            <NavItem icon={<IconUserCog size={20} strokeWidth={3} />} label="Account" isActive={selectedNavItem === "account"} onClick={() => setSelectedNavItem("account")} />
            <NavItem icon={<IconUserScreen size={20} strokeWidth={3} />} label="Profile" isActive={selectedNavItem === "profile"} onClick={() => setSelectedNavItem("profile")} />
            <LogoutButton />
          </nav>
          <main className="overflow-y-auto">
            {selectedNavItem === "profile" && <Profile />}
            {selectedNavItem === "account" && <Account />}
          </main>
        </div>
      </DialogContent>
    </Dialog>
  );
}


function NavItem({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
  return (
    <>
      <Button
        className={`flex items-center justify-start ${isActive ? "bg-gray-800 text-gray-100 hover:bg-gray-600 " : "bg-gray-200 text-black hover:text-black hover:bg-gray-300"}`}
        onClick={onClick}>
        {icon} {label}
      </Button>
    </>
  )
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
    <Button
      variant="destructive"
      onClick={handleLogout}
      disabled={isPending}
      className="flex justify-start mt-auto"
    >
      <IconLogout size={20} /> {isPending ? "Logging out..." : "Logout"}
    </Button>
  );
}
