'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useChatStore } from "@/src/store/chatStore";
import { useConversationStore } from "@/src/store/conversationStore";
import { IconAdjustmentsHorizontal, IconChevronRightFilled } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

export default function GroupItemCard({
  id,
  creator
}: {
  id: string;
  creator: number,
}) {
  const router = useRouter();
  const conv = useConversationStore((state) => state.conversations[Number(id)]);
  const authUser = useChatStore(state => state.authUser)
  function handleClick() {
    router.push(`/chat/groups/${id}?name=${conv.name}`);
  }

  function handleSettings() {
    router.push(`/chat/groups/${id}/settings`)
  }


  return (
    <Card className="aspect-square min-w-xs  rounded-md shadow-sm hover:shadow-lg transition-shadow" >
      <CardHeader>
        {conv.isPrivate && <InviteOnly />}
        <CardTitle className="font-bold">{conv.name} </CardTitle>
        <CardDescription>{conv.description}</CardDescription>
      </CardHeader>

      <CardContent>
        <p>You are the admin {creator}</p>
      </CardContent>

      <CardFooter className="mt-auto flex justify-between">
        {creator === authUser.id &&
          <Button
            size='icon-xs'
            variant={'outline'}
            className={'rounded-sm'}
            onClick={handleSettings}
          >
            <IconAdjustmentsHorizontal />
          </Button>
        }
        <Button
          size={'icon-xs'}
          variant={'default'}
          className={'rounded-sm ml-auto bg-blue-100 text-blue-700 hover:bg-blue-300'}
          onClick={() => handleClick()}>
          <IconChevronRightFilled size={16} />
        </Button>
      </CardFooter>
    </Card>
  );
};


function InviteOnly() {
  return (
    <span className="mb-1 text-xs w-max px-1.5 py-0.5 rounded-xs  bg-red-100 text-red-500 font-medium">
      INVITE ONLY
    </span>
  );
}
