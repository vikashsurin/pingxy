"use client";

import { useFetchInvites } from "@/lib/queries/conversations";
import { copyToClipboard } from "@/lib/utils/clipboard";
import { formatDate } from "@/lib/utils/date";
import { useOnClickOutside } from "@/lib/utils/useOnClickOutside";
import {
  Check,
  Clipboard,
  EllipsisVertical,
  SquarePen,
  Trash2,
} from "lucide-react";
import { useRef, useState } from "react";
export default function InviteList({ cid }: { cid: number }) {
  const { data, isPending, error } = useFetchInvites(cid);
  const [activeId, setActiveId] = useState<string | null>(null);

  console.log({ activeId });
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="p-4 bg-white border-b">
        <h2 className="font-bold text-lg">Invite List</h2>
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
                  <td className="p-3 font-mono text-[10px] break-all text-gray-600">
                    {invite.inviteCode}
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
                    <div
                      className="relative hover:bg-gray-200 p-2  w-max rounded-full active:bg-gray-300 flex items-center justify-center"
                      onClick={() => {
                        setActiveId(invite.id);
                      }}
                    >
                      <EllipsisVertical size={16} />
                      {activeId === invite.id && (
                        <ActionMenu
                          setActiveId={setActiveId}
                          inviteCode={invite.inviteCode}
                        />
                      )}
                    </div>
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
function ActionMenu({
  setActiveId,
  inviteCode,
}: {
  setActiveId: React.Dispatch<React.SetStateAction<string | null>>;
  inviteCode: string;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useOnClickOutside(menuRef, () => setActiveId(null));

  return (
    // "relative" here ensures "absolute" below is positioned correctly
    <div ref={menuRef} className="relative">
      <ul className="absolute top-full right-4 mt-1 min-w-30 bg-white border border-gray-200 p-1 rounded-md shadow-xl z-100">
        <CopyMenuItem text={inviteCode} onDone={() => setActiveId(null)} />

        <ActionMenuItem
          label="Edit"
          icon={<SquarePen size={14} className="text-gray-400" />}
          onClick={() => {
            console.log("Edit clicked");
            setActiveId(null);
          }}
        />
      </ul>
    </div>
  );
}

// Internal component to handle the specific "Copy" logic but keep the UI consistent
function CopyMenuItem({ text, onDone }: { text: string; onDone: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevents triggering row clicks
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      // Brief delay so user sees "Copied" before menu closes
      setTimeout(() => {
        setCopied(false);
        onDone();
      }, 800);
    }
  };

  return (
    <ActionMenuItem
      label={copied ? "Copied!" : "Copy"}
      icon={
        copied ? (
          <Check size={14} className="text-green-500" />
        ) : (
          <Clipboard size={14} className="text-gray-400" />
        )
      }
      onClick={handleCopy}
      className={copied ? "text-green-600 bg-green-50" : ""}
    />
  );
}

function ActionMenuItem({
  label,
  icon,
  onClick,
  className = "",
}: {
  label: string;
  icon: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
}) {
  return (
    <li
      role="button" // Accessibility
      className={`px-3 py-2 flex items-center gap-2 hover:bg-gray-100 rounded cursor-pointer text-sm transition-colors ${className}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
    >
      <span className="shrink-0">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
    </li>
  );
}
