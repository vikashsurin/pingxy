import { useQuery } from "@tanstack/react-query";
import { conversationManager } from "../managers/conversationManager";

export const useConversations = (type?: "direct" | "group") => {
  return useQuery({
    queryKey: ["conversations", type],
    queryFn: () => conversationManager.fetchConversations({ type }),
  });
};
