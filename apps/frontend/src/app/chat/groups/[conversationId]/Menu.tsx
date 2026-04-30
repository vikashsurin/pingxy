"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsRoomCreator } from "@/src/hooks";
import { IconDotsVertical } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

export default function Menu({ id }: { id: number }) {
  const isCreator = useIsRoomCreator(id);

  console.log({ iid: id });

  const router = useRouter();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant={"secondary"} size={"icon"} />}
      >
        <IconDotsVertical size={16} />
      </DropdownMenuTrigger>
      <DropdownMenuContent className={"rounded-md"}>
        {isCreator && (
          <DropdownMenuItem
            onClick={() => router.push(`/chat/groups/${id}/settings`)}
            className={"rounded-sm"}
          >
            Setting
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
