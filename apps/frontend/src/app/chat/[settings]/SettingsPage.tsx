import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { authApi } from "@/src/lib/api/authApi";
import { useChatStore } from "@/src/store/chatStore";
import { IconLogout, IconUserCog, IconSettings, IconUserScreen } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import Profile from "./Profile";
import { Separator } from "@/components/ui/separator";

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
          {/* TODO : make custom nav items */}
          <nav className="flex flex-col p-2 rounded-none bg-gray-200">
            <Button
              variant={'ghost'}
              className={`flex justify-start rounded-sm ${selectedNavItem === "account" ? "bg-gray-800 text-gray-100 " : ""}`}
              name="account"
              onClick={() => setSelectedNavItem("account")}
            >
              <IconUserCog size={28} /> Account
            </Button>

            <Button
              variant={'ghost'}
              className={`flex justify-start rounded-sm ${selectedNavItem === "profile" ? "bg-gray-800 text-gray-100 " : ""}`}
              name="profile"
              onClick={() => setSelectedNavItem("profile")}
            >
              <IconUserScreen size={44} /> Profile
            </Button>
            <LogoutButton />
          </nav>
          <main className="overflow-y-auto">
            {selectedNavItem === "profile" && <Profile />}
          </main>
        </div>
      </DialogContent>
    </Dialog>
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
