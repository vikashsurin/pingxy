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
import Loading from "@/src/components/Loading";
import { formatDate } from "@/src/lib/utils/date";

import {
  useCreateInvite,
  useDeleteConversation,
  useFetchConversation,
} from "@/src/queries/conversations";
import {
  IconAlertSquareRounded,
  IconCaretDownFilled,
  IconCaretUpFilled,
  IconCircleCheck,
  IconCopy,
} from "@tabler/icons-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import InviteList from "./InviteList";
export default function AdminPage() {
  const params = useParams();
  const slug = params.slug;
  const [moreActions, setMoreActions] = useState(false);

  const { data, isLoading, isPending, isError, isSuccess } =
    useFetchConversation(Number(slug));

  if (isLoading) return <Loading />;
  if (isError) return <p>Error</p>;

  return (
    <div className="m-2 border border-gray-300 bg-gray-100 rounded-md  p-4 ">
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">{data?.name}</h2>
        <div>
          <p>
            <span className="text-sm text-gray-500 ">Description:</span>
            {data?.description}
          </p>
          <p className="text-xs text-gray-500 ">
            created at : {formatDate(data?.createdAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <div className="border border-gray-300 bg-white py-2 px-3 rounded-md  flex gap-2 items-center">
            <p>{data?.isPrivate ? "Private" : "Public"}</p>
            <Button size="xs" className={"rounded-sm"}>
              Modify
            </Button>
          </div>
          <div className="border border-gray-300 bg-white py-2 px-3 rounded-md  flex gap-2 items-center">
            <p>Max Participants:{data?.maxParticipants}</p>
            <Button size="xs" className={"rounded-sm"}>
              Modify
            </Button>
          </div>
          <div className="flex items-end underline py-2 px-3 text-gray-500 hover:text-blue-600">
            <a href={`/chat/groups/${slug}/settings/participants`}>
              view all participants
            </a>
          </div>
        </div>
        <div className="separator border border-gray-200 "></div>
        <GenerateInviteLink cid={data?.id} />
        <InviteList cid={data?.id} />
        <div className="flex flex-col border p-2 rounded-lg gap-2 w-max bg-gray-50">
          <Button
            size="xs"
            className="rounded-sm w-max"
            onClick={() => {
              setMoreActions(!moreActions);
            }}
          >
            {moreActions ? "Hide actions" : "More actions"}
            {moreActions ? <IconCaretUpFilled /> : <IconCaretDownFilled />}
          </Button>

          {moreActions && <ControlSection id={parseInt(data?.id)} />}
        </div>
      </div>
    </div>
  );
}

function GenerateInviteLink({ cid }: { cid: number }) {
  const { data, mutate, isPending, error } = useCreateInvite();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (data?.inviteCode) {
      try {
        await navigator.clipboard.writeText(data.inviteCode);
        setCopied(true);
      } catch (err) {
        console.error("Failed to copy!", err);
      }
    }
  };

  useEffect(() => {
    if (!copied) return;

    const timer = setTimeout(() => {
      setCopied(false);
    }, 2000);

    return () => clearTimeout(timer); // Clean up on unmount or re-render
  }, [copied]);

  return (
    <div className="flex flex-col gap-2 ">
      <Button
        className="w-max rounded-sm"
        size="xs"
        onClick={() => mutate(cid)}
        disabled={isPending}
      >
        {isPending ? "Generating..." : "Generate Invite Link"}
      </Button>

      {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}

      {data?.inviteCode && (
        <div className="flex p-2 w-max items-center border border-gray-300 rounded-md hover:outline-2 hover:outline-blue-400">
          <p className="text-gray-600 px-2">{data.inviteCode}</p>
          <button
            type="button"
            title="Copy invite link"
            onClick={handleCopy}
            className="p-2 bg-gray-100 rounded-full hover:bg-blue-500 active:bg-blue-600 hover:text-white"
          >
            {copied ? (
              <IconCircleCheck size={16} className="text-green-500" />
            ) : (
              <IconCopy size={16} />
            )}
          </button>
        </div>
      )}
    </div>
  );
}

function ControlSection({ id }: { id: number }) {
  const router = useRouter();
  const { mutate, isPending, error } = useDeleteConversation();

  function handleClick() {
    mutate(id, {
      onSuccess: () => {
        router.push("/chat/groups");
      },
    });
  }
  return (
    <div>
      <AlertDialog>
        <AlertDialogTrigger
          render={<Button variant="destructive" className="rounded-sm" />}
        >
          <IconAlertSquareRounded size={16} />
          Delete Group
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClick}>
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
