import { attachmentReqSchema } from "@pingxy/shared/domain/attachment/index";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import z from "zod";
import queryClient from "../lib/queryClient";
import { conversationService } from "../services/conversationService";

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

export const useSendMessage = () => {
  return useMutation({
    mutationFn: async ({
      conversationId,
      content,
      recipientId,
      recipientName,
      attachments = [],
    }: {
      conversationId: number | undefined;
      content: string;
      recipientId: number | undefined;
      recipientName: string | undefined;
      attachments: z.infer<typeof attachmentReqSchema>[];
    }) =>
      conversationService.createMessage({
        conversationId,
        content,
        recipientId,
        recipientUsername: recipientName,
        attachments,
      }),

    onSuccess: (response) => {
      const { data } = response;
      const { payload } = data;
      const { message } = payload;

      queryClient.invalidateQueries({
        queryKey: ["messages", message.conversationId],
      });
    },
  });
};

export const useMessages = (conversationId: number) => {
  return useInfiniteQuery({
    // Always use a consistent type for the ID (I recommend Number)
    queryKey: ["messages", conversationId],
    queryFn: ({ pageParam }: { pageParam: number | undefined }) =>
      conversationService.fetchMessages(conversationId, 20, pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
    enabled: !!conversationId, // Don't run if ID is missing
  });
};

export const useFetchMessages = (conversationId: number) => {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => conversationService.fetchMessages(conversationId),
  });
};

export const useDeleteConversation = () => {
  return useMutation({
    mutationFn: (conversationId: number) =>
      conversationService.deleteConversation({ conversationId }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversations", "group"],
      });
    },
  });
};
