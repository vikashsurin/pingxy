"use client";


import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Loading from "@/src/components/Loading";
import {
  useDeleteConversation,
  useFetchConversation
} from "@/src/hooks/api/conversations";
import { formatDate } from "@/src/lib/utils/date";
import {
  IconCalendar,
  IconChevronRight,
  IconLockSquareRounded,
  IconUsers
} from "@tabler/icons-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import InviteList from "./InviteList";
export default function AdminPage() {
  const params = useParams();
  const conversationId = params.conversationId;
  const [moreActions, setMoreActions] = useState(false);

  console.log({ conversationId: Number(conversationId) })

  const { data, isLoading, isPending, isError, isSuccess } =
    useFetchConversation(Number(conversationId));

  if (isLoading || isPending) return <Loading />;
  if (isError) return <p>Error</p>;

  if (isSuccess)
    return (
      <div className="m-2 flex flex-col gap-3  rounded-2xl  ">
        <section className="flex flex-col gap-1 bg-gray-100 p-4  rounded-xl ">
          <p className="flex items-center gap-1 text-xs text-gray-500 ">
            <IconCalendar size={14} /> Created {formatDate(data?.createdAt)}
          </p>
          <h2 className="text-2xl font-bold">{data?.name}</h2>
          <div>
            <p className="flex  items-center text-sm text-gray-500">
              {data?.description}
              <Button size="xs" variant={'ghost'} className={"rounded-sm"}>
                modify
              </Button>
            </p>
          </div>
          <div className="flex gap-2">
            <div className=" rounded-md flex items-end gap-4 p-4 bg-white">
              <span className="flex items-center gap-2 bg-gray-100 p-3 rounded-sm">
                <IconLockSquareRounded size={24} className="text-gray-500" />
              </span>
              <div className="">
                <span className="text-xs text-gray-400 font-medium">
                  Access Level
                </span>
                <p className=" font-bold">
                  {data?.isPrivate ? "Invite Only" : "Public"}
                </p>
              </div>
              <Button size="xs" variant={'secondary'} className={"rounded-sm text-blue-600"}>
                Modify
              </Button>
            </div>

            <div className="rounded-md flex items-end gap-4 p-4 bg-white">
              <span className="flex items-center gap-2 bg-gray-100 p-3 rounded-sm">
                <IconUsers size={24} className="text-gray-500" />
              </span>
              <div className="">
                <span className="text-xs text-gray-400 font-medium">
                  Max Participants
                </span>
                <p className=" font-bold">
                  {data?.maxParticipants}
                </p>
              </div>
              <Button size="xs" variant={'secondary'} className={"rounded-sm text-blue-600"}>
                Modify
              </Button>
            </div>


          </div>
        </section>

        <section>
          <Button size={'sm'} variant={'secondary'} className={"group rounded-sm text-blue-700"}>
            <a href={`/chat/groups/${conversationId}/settings/members`}
            >
              Manage Members
            </a>
            <IconChevronRight size={20} className="transition-all inline-block group-hover:ml-2" />
          </Button>
          <Button size="sm" variant={'secondary'} className={"rounded-sm text-blue-700 ml-2"}>
            + Add Member
          </Button>
        </section>

        <InviteList cid={data?.id} />

        <section className="flex items-center gap-3 p-8 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex flex-col gap-3 ">
            <h2 className="font-bold text-lg mb-1 text-red-500">
              Danger Zone
            </h2>
            <p className="text-gray-700 text-sm text-wrap ">Deleting a group is permanent and cannot be undone. All associated data, including members and logs, will be wiped from the system.</p>
          </div>
          <DeleteGroupDialog id={parseInt(data?.id)} name={data?.name} />
        </section>
      </div>
    );
}


function ModifyDescription() {
  return (
    <div>
      {/*dialog*/}
    </div>
  )
}

function DeleteGroupDialog({ id, name }: { id: number; name: string }) {
  const router = useRouter();

  const [confirmName, setConfirmName] = useState("");

  const { mutate, isPending, error } = useDeleteConversation();

  function handleClick() {
    mutate(id, {
      onSuccess: () => {
        router.push("/chat/groups");
      },
    });
  }
  return (
    <div className="">
      <AlertDialog >
        <AlertDialogTrigger
          render={<Button variant="destructive" size='lg' className="rounded-sm bg-red-500 text-white  font-bold" />}
        >
          Delete Group
        </AlertDialogTrigger>
        <AlertDialogContent className={'rounded-lg'}>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the group.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            placeholder={`Type ${name} to confirm`}
            value={confirmName} onChange={(e) => setConfirmName(e.target.value)} />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClick} disabled={confirmName !== name}>
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
