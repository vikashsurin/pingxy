"use client";
import Loading from "@/src/components/Loading";
import {
  useCreateInvite,
  useFetchConversation,
} from "@/src/queries/conversations";
import { formatDate } from "@/src/lib/utils/date";
import { Clipboard } from "lucide-react";
import { useParams } from "next/navigation";
import InviteList from "./InviteList";
export default function AdminPage() {
  const params = useParams();
  const slug = params.slug;

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
            <button
              type="button"
              className="text-sm bg-sky-600 rounded px-1 text-white"
            >
              Modify
            </button>
          </div>
          <div className="border border-gray-300 bg-white py-2 px-3 rounded-md  flex gap-2 items-center">
            <p>Max Participants:{data?.maxParticipants}</p>
            <button
              type="button"
              className="text-sm bg-sky-600 rounded px-1 text-white"
            >
              Modify
            </button>
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
      </div>
    </div>
  );
}

function GenerateInviteLink({ cid }: { cid: number }) {
  const { data, mutate, isPending, error } = useCreateInvite();

  function handleCopy() {
    if (data?.inviteCode) {
      navigator.clipboard.writeText(data.inviteCode);
    }
  }

  return (
    <div className="flex flex-col gap-2 ">
      <button
        type="button"
        className="bg-blue-500 flex text-sm font-bold rounded-xs text-white px-2 py-1 disabled:opacity-50 w-max"
        onClick={() => mutate(cid)}
        disabled={isPending}
      >
        {isPending ? "Generating..." : "Generate Invite Link"}
      </button>

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
            <Clipboard size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
