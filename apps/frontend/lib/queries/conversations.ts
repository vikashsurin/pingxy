import { useMutation, useQuery } from "@tanstack/react-query";
import { conversationManager } from "../managers/conversationManager";
import queryClient from "../queryClient";

export const useConversations = (type?: "direct" | "group") => {
  return useQuery({
    queryKey: ["conversations", type],
    queryFn: () => conversationManager.fetchConversations({ type }),
  });
};

export const useCreateInvite = () => {
  return useMutation({
    mutationFn: (convId: number) =>
      conversationManager.createInvite({ conversationId: convId }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversations", "invites"],
      });
    },
  });
};

export const useFetchInvites = (conversationId: number) => {
  return useQuery({
    queryKey: ["conversations", "invites"],
    queryFn: () => conversationManager.fetchInvites({ conversationId }),
  });
};

export const useFetchConversation = (conversationId: number) => {
  return useQuery({
    queryKey: ["conversations", conversationId],
    queryFn: () => conversationManager.fetchConversation({ conversationId }),
  });
};

export const useFetchParticipants = (conversationId: number) => {
  return useQuery({
    queryKey: ["participants", conversationId],
    queryFn: () => conversationManager.fetchParticipants({ conversationId }),
  });
};
