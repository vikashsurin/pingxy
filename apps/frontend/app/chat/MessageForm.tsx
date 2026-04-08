import { conversationManager } from "@/lib/managers/conversationManager";
import queryClient from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

// Assuming your API helper is imported here
// import { conversationsApi } from "./api";
export default function MessageForm({
  conversationId,
  recipientId,
  recipientName,
}: {
  conversationId: number;
  recipientId: number;
  recipientName: string;
}) {
  console.log("receipeint name: ", recipientName);
  const [content, setContent] = useState("");

  const mutation = useMutation({
    // 1. The function that calls your API
    mutationFn: async () =>
      conversationManager.createMessage({
        conversationId,
        content,
        recipientId,
        recipientUsername: recipientName,
      }),

    // 2. What happens after the message is sent successfully
    onSuccess: (data) => {
      console.log("Message sent successfully:", data);
      setContent(""); // Clear the input
      // Refresh the message list so the new message appears
      queryClient.invalidateQueries({
        queryKey: ["messages", String(conversationId)],
      });
    },
  });

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!content.trim() || mutation.isPending) return;

    mutation.mutate();
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-2 border-t bg-white">
      <label className="w-full">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`Message ${recipientName}...`}
          className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={mutation.isPending}
        />
      </label>
      <button
        type="submit"
        disabled={mutation.isPending || !content.trim()}
        className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:bg-gray-400 hover:bg-blue-700 transition-colors"
      >
        {mutation.isPending ? "..." : "Send"}
      </button>
    </form>
  );
}
