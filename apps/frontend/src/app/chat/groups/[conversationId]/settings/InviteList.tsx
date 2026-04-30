"use client";

import {
  IconCircleCheck,
  IconCopy,
  IconDotsVertical,
  IconEdit,
} from "@tabler/icons-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { copyToClipboard } from "@/src/lib/utils/clipboard";
import { formatDate } from "@/src/lib/utils/date";
import { useFetchInvites } from "@/src/hooks/api/conversations";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import DeleteSelectedInvites from "./DeleteSelectedInvites";

export default function InviteList({ cid }: { cid: number }) {
  const { data, isPending, error } = useFetchInvites(cid);
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
      setSelectedIds(data.map((invite) => invite.id)); // Select all
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
    <div className="flex flex-col h-full min-h-0 border rounded-lg overflow-hidden">
      {selectedIds.length > 0 && (
        <DeleteSelectedInvites
          selectedIds={selectedIds}
          clearSelected={clearSelected}
        />
      )}
      <div className="p-4 bg-white border-b">
        <h2 className="font-bold text-lg">Manage Invite Codes</h2>
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
                    className="rounded border-gray-300 m-2"
                    title="select all"
                  />
                </th>
                <th className="p-3">Code</th>
                <th className="p-3 whitespace-nowrap">Created At</th>
                <th className="p-3 whitespace-nowrap">Expires At</th>
                <th className="p-3">Uses</th>
                <th className="p-3">Max</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y">
              {data.map((invite) => (
                <tr
                  key={invite.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(invite.id)}
                      onChange={() => handleSelectOne(invite.id)}
                      className="rounded border-gray-300 m-2"
                      title="select"
                    />
                  </td>
                  <td className="  items-center p-3 font-mono text-[10px] break-all text-gray-500 ">
                    <div
                      // data-value={invite.inviteCode}
                      title="click to copy"
                      className="flex items-center gap-2 border w-max px-2 py-1 hover:border-gray-500 rounded hover:text-gray-900"
                      onClick={(e) => handleCopy(e, invite.inviteCode)}
                    >
                      {invite.inviteCode}
                      {copiedCode === invite.inviteCode ? (
                        <IconCircleCheck size={14} className="text-green-500" />
                      ) : (
                        <IconCopy size={14} />
                      )}
                    </div>
                  </td>
                  <td className="p-3 whitespace-nowrap text-gray-600">
                    {formatDate(invite.createdAt)}
                  </td>
                  <td className="p-3 whitespace-nowrap text-gray-600">
                    {formatDate(invite.expiresAt)}
                  </td>
                  <td className="p-3 text-gray-900 font-medium">
                    {invite.usesCount}
                  </td>
                  <td className="p-3 text-gray-900 font-medium">
                    {invite.maxUses}
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

function ActionMenu({ id }: { id?: number }) {
  const router = useRouter();
  const pathname = usePathname();

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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
