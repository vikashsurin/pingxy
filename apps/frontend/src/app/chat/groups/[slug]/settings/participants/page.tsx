"use client";

import Loading from "@/src/components/Loading";
import Dialog from "@/src/components/ui/Dialog";
import { useFetchParticipants } from "@/src/queries/conversations";
import { useParams } from "next/navigation";
import React, { useState } from "react";

export default function Page({}) {
  const params = useParams();
  const slug = params.slug;

  const [isOpenRemoveDialog, setIsOpenRemoveDialog] = useState(false);

  const { data, isLoading, isPending, isError, isSuccess } =
    useFetchParticipants(Number(slug));

  if (isLoading) return <Loading />;
  if (isError) return <p>Error</p>;

  return (
    <div className="m-2 p-4 rounded-lg border border-gray-300 bg-gray-100">
      {isOpenRemoveDialog && (
        <RemoveParticipantDialog
          setIsOpenRemoveDialog={setIsOpenRemoveDialog}
        />
      )}
      <h2 className="font-bold text-lg">Participants</h2>
      <div>
        <ul>
          {data?.map((participant: any) => (
            <li
              key={participant.id}
              className="flex gap-2 p-2 hover:bg-gray-200 rounded-sm"
            >
              <span>{participant.username}</span>
              <span className="text-gray-400">{participant.role}</span>
              <button
                type="button"
                className="bg-red-600 text-xs py-1 px-1.5 rounded text-white ml-auto hover:bg-red-500"
                onClick={() => setIsOpenRemoveDialog(true)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function RemoveParticipantDialog({
  setIsOpenRemoveDialog,
}: {
  setIsOpenRemoveDialog: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <Dialog>
      <div>
        <p className="p-3">Are you sure you want to remove this participant?</p>
        <div className="flex gap-2">
          <button
            type="button"
            className="bg-gray-600 text-xs py-1 px-1.5 rounded text-white ml-auto hover:bg-gray-500"
            onClick={() => setIsOpenRemoveDialog(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="bg-red-600 text-xs py-1 px-1.5 rounded text-white  hover:bg-red-500"
            onClick={() => setIsOpenRemoveDialog(false)}
          >
            Remove
          </button>
        </div>
      </div>
    </Dialog>
  );
}
