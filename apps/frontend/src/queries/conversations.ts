import { useMutation, useQuery } from "@tanstack/react-query";
import { conversationService } from "../services/conversationService";
import queryClient from "../lib/queryClient";

export const useConversations = (type?: "direct" | "group") => {
  return useQuery({
    queryKey: ["conversations", type],
    queryFn: () => conversationService.fetchConversations({ type }),
  });
};

export const useCreateInvite = () => {
  return useMutation({
    mutationFn: (convId: number) =>
      conversationService.createInvite({ conversationId: convId }),
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
    queryFn: () => conversationService.fetchInvites({ conversationId }),
  });
};

export const useFetchConversation = (conversationId: number) => {
  return useQuery({
    queryKey: ["conversations", conversationId],
    queryFn: () => conversationService.fetchConversation({ conversationId }),
  });
};

export const useFetchParticipants = (conversationId: number) => {
  return useQuery({
    queryKey: ["participants", conversationId],
    queryFn: () => conversationService.fetchParticipants({ conversationId }),
  });
};
