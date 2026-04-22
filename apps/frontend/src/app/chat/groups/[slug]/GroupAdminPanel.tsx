// import Dialog from "@/components/ui/Dialog";
// import { useCreateInvite, useFetchInvites } from "@/lib/queries/conversations";
// import { formatDate } from "@/lib/utils/date";
// import { Clipboard, X } from "lucide-react";

// export default function GroupAdminPanel({
//   conversationId,
//   setActiveMenu,
// }: {
//   conversationId: string;
//   setActiveMenu: React.Dispatch<React.SetStateAction<string>>;
// }) {
//   const cid = parseInt(conversationId);

//   return (
//     <Dialog>
//       <div className="h-156 w-4xl flex flex-col">
//         <section className="flex justify-between items-start">
//           <h2 className="font-bold text-lg mb-4">Group Admin Panel</h2>
//           <button
//             type="button"
//             title="close panel"
//             onClick={() => setActiveMenu("")}
//             className="p-1 rounded-full hover:bg-gray-100 active:bg-gray-200"
//           >
//             <X size={16} />
//           </button>
//         </section>
//         <section className="flex flex-col gap-2 items-center justify-center">
//           <GenerateInviteLink cid={cid} />
//         </section>

//         <section className="flex flex-1 flex-col min-h-0 border border-gray-300 rounded-lg overflow-hidden mt-2">
//           <InviteList cid={cid} />
//         </section>
//       </div>
//     </Dialog>
//   );
// }

// function GenerateInviteLink({ cid }: { cid: number }) {
//   const { data, mutate, isPending, error } = useCreateInvite();

//   function handleCopy() {
//     if (data?.inviteCode) {
//       navigator.clipboard.writeText(data.inviteCode);
//     }
//   }

//   return (
//     <div className="flex flex-col gap-2 items-center justify-center">
//       <button
//         type="button"
//         className="bg-blue-500 flex text-sm font-bold rounded-xs text-white px-2 py-1 disabled:opacity-50"
//         onClick={() => mutate(cid)}
//         disabled={isPending}
//       >
//         {isPending ? "Generating..." : "Generate Invite Link"}
//       </button>

//       {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}

//       {data?.inviteCode && (
//         <div className="flex p-2 m-4 items-center border border-gray-300 rounded-full hover:outline-2 hover:outline-blue-400">
//           <p className="text-gray-600 px-2">{data.inviteCode}</p>
//           <button
//             type="button"
//             title="Copy invite link"
//             onClick={handleCopy}
//             className="p-2 bg-gray-100 rounded-full hover:bg-blue-500 active:bg-blue-600 hover:text-white"
//           >
//             <Clipboard size={16} />
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// function InviteList({ cid }: { cid: number }) {
//   const { data, isPending, error } = useFetchInvites(cid);

//   return (
//     <div className="flex flex-col h-full min-h-0">
//       <div className="p-4 bg-white border-b">
//         <h2 className="font-bold text-lg">Invite List</h2>
//       </div>

//       {isPending && <p className="p-4">Loading...</p>}
//       {error && <p className="p-4 text-red-500">{error.message}</p>}

//       {data && (
//         /* This container now handles the scrolling */
//         <div className="flex-1 overflow-y-auto">
//           <table className="w-full border-collapse">
//             {/* sticky top-0 keeps the header visible while scrolling */}
//             <thead className="sticky top-0 bg-gray-50 z-10 border-b shadow-sm">
//               <tr className="text-left text-xs uppercase text-gray-500 font-semibold">
//                 <th className="p-3">Code</th>
//                 <th className="p-3 whitespace-nowrap">Created At</th>
//                 <th className="p-3 whitespace-nowrap">Expires At</th>
//                 <th className="p-3">Uses</th>
//                 <th className="p-3">Max</th>
//               </tr>
//             </thead>
//             <tbody className="text-sm divide-y">
//               {data.map((invite) => (
//                 <tr
//                   key={invite.id}
//                   className="hover:bg-gray-50 transition-colors"
//                 >
//                   <td className="p-3 font-mono text-[10px] break-all text-gray-600">
//                     {invite.inviteCode}
//                   </td>
//                   <td className="p-3 whitespace-nowrap text-gray-600">
//                     {formatDate(invite.createdAt)}
//                   </td>
//                   <td className="p-3 whitespace-nowrap text-gray-600">
//                     {formatDate(invite.expiresAt)}
//                   </td>
//                   <td className="p-3 text-gray-900 font-medium">
//                     {invite.usesCount}
//                   </td>
//                   <td className="p-3 text-gray-900 font-medium">
//                     {invite.maxUses}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// }
