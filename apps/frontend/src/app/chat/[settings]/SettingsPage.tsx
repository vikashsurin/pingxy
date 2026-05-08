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
import { IconLogout, IconSettings, IconUserScreen } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import Profile from "./Profile";

export default function SettingsPage() {
  const [selectedNavItem, setSelectedNavItem] = useState<string>("profile");

  return (
    <Dialog>
      <DialogTrigger
        className={"flex gap-2 items-center hover:bg-gray-200 p-2 rounded-md  "}
      >
        <IconSettings size={20} /> Settings
      </DialogTrigger>

      <DialogContent className="rounded-xl min-h-[80vh] min-w-[80vw] max-w-[80vw] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-[200px_1fr] flex-1 overflow-hidden">
          <nav className="flex flex-col p-2  rounded-md">
            <Button
              variant="ghost"
              className={"flex justify-start"}
              name="profile"
              onClick={() => setSelectedNavItem("profile")}
            >
              <IconUserScreen size={20} /> Profile
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
      className="flex justify-start"
    >
      <IconLogout size={20} /> {isPending ? "Logging out..." : "Logout"}
    </Button>
  );
}
