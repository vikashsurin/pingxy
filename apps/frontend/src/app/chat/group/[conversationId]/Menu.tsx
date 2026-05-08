"use client";

import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useIsRoomCreator } from "@/src/hooks";
import { IconDoorExit, IconDotsVertical } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Menu({ id }: { id: number }) {

  const [dialogOpen, setDialogOpen] = useState(false);

  const isCreator = useIsRoomCreator(id);

  const router = useRouter();
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant={"ghost"} size={"icon"} className={'rounded-full'} />}
        >
          <IconDotsVertical size={16} />
        </DropdownMenuTrigger>
        <DropdownMenuContent className={"rounded-md"}>
          {isCreator && (
            <DropdownMenuItem
              onClick={() => router.push(`/chat/group/${id}/settings`)}
              className={"rounded-sm"}
            >
              Setting
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            className={'rounded-sm text-red-600'}
            onClick={() => setDialogOpen(true)}>
            Leave Group
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu >

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent className={'rounded-lg'}>
          <p>Are you sure you want to leave this group?</p>
          <AlertDialogFooter>
            <Button variant={"secondary"} onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant={"destructive"} onClick={() => router.push(`/chat/groups`)}>
              Leave
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
