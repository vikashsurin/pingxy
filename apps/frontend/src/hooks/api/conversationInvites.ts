import { useMutation, useQuery } from "@tanstack/react-query";
import queryClient from "../../lib/queryClient";
import { conversationInviteService } from "../../services/conversationInviteService";

export const useFetchInvite = (id: number) => {
  return useQuery({
    queryKey: ["invites", id],
    queryFn: () => conversationInviteService.fetchInvite({ inviteId: id }),
  });
};

export const useJoinViaInvite = () => {
  return useMutation({
    mutationFn: (inviteCode: string) =>
      conversationInviteService.joinViaInvite({ inviteCode }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversations", "group"],
      });
    },
  });
};

export const useDeleteInvites = () => {
  return useMutation({
    mutationFn: (ids: number[]) =>
      conversationInviteService.deleteInvites({ ids }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversations", "invites"],
      });
    },
  });
};
