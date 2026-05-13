"use client";

import {
  IconCircleCheck,
  IconCopy,
  IconDotsVertical,
  IconEdit,
  IconUnlink,
} from "@tabler/icons-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRevokeInvite } from "@/src/hooks";
import { useFetchInvites } from "@/src/hooks/api/useConversations";
import { copyToClipboard } from "@/src/lib/utils/clipboard";
import { formatDate } from "@/src/lib/utils/date";
import { truncateUUID } from "@/src/lib/utils/truncateUUID";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import DeleteSelectedInvites from "./DeleteSelectedInvites";
import GenerateInviteLink from "./GenerateInviteLink";

export default function InviteList({ cid }: { cid: number }) {
  const { data, isPending, error } = useFetchInvites(cid);

  console.log({ invitelist: data });
  const [activeId, setActiveId] = useState<string | null>(null);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const selectAllRef = useRef<HTMLInputElement>(null);

  // 1. Sync the "dash" (indeterminate) look for the header checkbox
  useEffect(() => {
    if (selectAllRef.current) {
      const isAllSelected =
        selectedIds.length === data.length && data.length > 0;
      const isSomeSelected =
        selectedIds.length > 0 && selectedIds.length < data.length;

      selectAllRef.current.indeterminate = isSomeSelected;
    }
  }, [selectedIds, data]);

  // 2. Handler to toggle everything
  const handleSelectAll = () => {
    if (selectedIds.length === data.length) {
      setSelectedIds([]); // Deselect all
    } else {
      setSelectedIds(data.map((invite: any) => invite.id)); // Select all
    }
  };

  // 3. Handler for individual rows
  const handleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  function clearSelected() {
    setSelectedIds([]);
  }
  console.log({ selectedIds });

  const [copiedCode, setCopiedCode] = useState("");

  const handleCopy = async (e: React.MouseEvent, code: string) => {
    e.stopPropagation(); // Prevents triggering row clicks

    const success = await copyToClipboard(code);
    if (success) {
      setCopiedCode(code);
      // Brief delay so user sees "Copied" before menu closes
      setTimeout(() => {
        setCopiedCode("");
        setActiveId(null);
      }, 800);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 border rounded-xl overflow-hidden">
      {selectedIds.length > 0 && (
        <DeleteSelectedInvites
          selectedIds={selectedIds}
          clearSelected={clearSelected}
        />
      )}
      <div className="p-4 bg-white border-b flex justify-between">
        <h2 className="font-bold text-lg">Manage Invite Codes</h2>
        <GenerateInviteLink conversationId={cid} />
      </div>

      {isPending && <p className="p-4">Loading...</p>}
      {error && <p className="p-4 text-red-500">{error.message}</p>}

      {data && (
        /* This container now handles the scrolling */
        <div className="flex-1 overflow-y-auto">
          <table className="w-full border-collapse">
            {/* sticky top-0 keeps the header visible while scrolling */}
            <thead className="sticky top-0 bg-gray-50 z-10 border-b shadow-sm">
              <tr className="text-left text-xs uppercase text-gray-500 font-semibold">
                <th>
                  <input
                    type="checkbox"
                    ref={selectAllRef}
                    checked={
                      selectedIds.length === data.length && data.length > 0
                    }
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 mx-4"
                    title="select all"
                  />
                </th>
                <th className="p-3">Code</th>
                <th className="p-3">Status</th>
                <th className="p-3 whitespace-nowrap">Created At</th>
                <th className="p-3 whitespace-nowrap">Expiry</th>
                <th className="p-3">Usage</th>
                {/*<th className="p-3">Max Uses</th>*/}
              </tr>
            </thead>
            <tbody className="text-sm divide-y">
              {data.map((invite: any) => (
                <tr
                  key={invite.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(invite.id)}
                      onChange={() => handleSelectOne(invite.id)}
                      className="rounded border-gray-300 mx-4"
                      title="select"
                    />
                  </td>
                  <td className="  items-center p-3  font-sans  break-all text-gray-500 ">
                    <div
                      title="click to copy"
                      className="flex w-max px-2 rounded items-center gap-2 hover:bg-gray-200"
                      onClick={(e) => handleCopy(e, invite.inviteCode)}
                    >
                      {truncateUUID(invite.inviteCode)}
                      {copiedCode === invite.inviteCode ? (
                        <IconCircleCheck size={16} className="text-green-500" />
                      ) : (
                        <IconCopy size={16} />
                      )}
                    </div>
                  </td>
                  <td className="p-3 whitespace-nowrap text-gray-600">
                    {invite.revokedAt ? (
                      <RevokedTag />
                    ) : invite.expiresAt &&
                      new Date(invite.expiresAt) >= new Date() ? (
                      <ActiveTag />
                    ) : (
                      <ExpiredTag />
                    )}
                  </td>
                  <td className="p-3 whitespace-nowrap text-xs text-gray-600">
                    {formatDate(invite.createdAt)}
                  </td>
                  <td className="p-3 whitespace-nowrap text-gray-600">
                    {invite.revokedAt ? (
                      "N/A"
                    ) : (
                      <ExpiryCell expiry={invite.expiresAt} />
                    )}
                  </td>
                  <td className="p-3 text-gray-900 font-medium">
                    {/*{invite.usesCount}/{invite.maxUses}*/}
                    <UsageCell used={invite.usesCount} total={invite.maxUses} />
                  </td>
                  <td>
                    <ActionMenu id={invite.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ActiveTag() {
  return (
    <span className="inline-block rounded-sm bg-green-100 px-1.5 py-0.5 text-xs text-green-800">
      Active
    </span>
  );
}

function ExpiredTag() {
  return (
    <span className="inline-block rounded-sm bg-red-100 px-1.5 py-0.5 text-xs text-red-800">
      Expired
    </span>
  );
}

function RevokedTag() {
  return (
    <span className="inline-block rounded-sm bg-yellow-100 px-1.5 py-0.5 text-xs text-yellow-800">
      Revoked
    </span>
  );
}

function ExpiryCell({ expiry }: { expiry: string }) {
  const expiryDate = new Date(expiry);
  const now = new Date();
  const diffInDays = Math.ceil(
    (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );

  const isExpired = diffInDays < 0;
  const isUrgent = diffInDays <= 3 && !isExpired;

  const formattedDate = formatDate(expiryDate);

  return (
    <div className="flex flex-col gap-0.5">
      <span
        className={`text-sm font-medium ${
          isExpired
            ? "text-destructive"
            : isUrgent
              ? "text-orange-600"
              : "text-foreground"
        }`}
      >
        {isExpired
          ? "Expired"
          : diffInDays === 0
            ? "Expires today"
            : `${diffInDays} days left`}
      </span>
      <span className="text-xs text-muted-foreground">{formattedDate}</span>
    </div>
  );
}

function UsageCell({ used, total }: { used: number; total: number }) {
  const percentage = (used / total) * 100;
  const isNearLimit = percentage > 80;

  return (
    <div className="flex flex-col gap-1">
      <span
        className={
          isNearLimit ? "text-orange-600 font-medium" : "text-foreground"
        }
      >
        {used}/{total}
      </span>
      {/* Optional: Tiny progress bar */}
      <div className="h-1 w-16 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${isNearLimit ? "bg-orange-500" : "bg-blue-500"}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function ActionMenu({ id }: { id?: number }) {
  const router = useRouter();
  const pathname = usePathname();

  const { mutate, isPending } = useRevokeInvite();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="p-2  rounded-full hover:bg-gray-200 active:bg-gray-300 transition-colors">
        <IconDotsVertical size={16} />
      </DropdownMenuTrigger>

      <DropdownMenuContent className="rounded-md ">
        <DropdownMenuItem
          className="rounded-sm text-sm"
          onClick={() => {
            router.push(`${pathname}/invite-code/${id}`);
          }}
        >
          <IconEdit size={12} />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          className="rounded-sm text-sm"
          onClick={() => {
            if (id) mutate(id);
          }}
        >
          <IconUnlink size={12} />
          {isPending ? "Revoke..." : "Revoke"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
