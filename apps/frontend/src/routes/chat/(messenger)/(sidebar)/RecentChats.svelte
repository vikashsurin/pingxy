<script lang="ts">
  import { page } from "$app/state";
  import { conversationStore } from "$lib/stores/conversationStore.svelte";
  import { userStore } from "$lib/stores/userStore.svelte";
  import { type UIConversation } from "$lib/types/chat";
  import GenderIcon from "../GenderIcon.svelte";

  let urlArray = $derived(page.url.pathname.split("/"));

  //   const chats = $derived(Array.from(conversationStore.conversationByPartnerId));

  const handleClick = async (conversation: UIConversation) => {
    if (!conversation.conversationId) return;

    // chatStore.chatTarget = {
    //   isUser: false,
    //   type: "direct",
    //   displayName: conversation.displayName,
    //   partner: conversation.partner,
    //   unreadCount: conversation.unreadCount,
    //   participants: conversation.participants,
    //   conversationId: conversation.conversationId,
    // };
  };
</script>

<div class="flex-1 flex flex-col overflow-hidden">
  <ul class=" overflow-y-auto w-full">
    {#each conversationStore.recentChats as c (c.id)}
      {@render thread(c.id, c.partnerId)}
    {/each}
  </ul>
</div>

{#snippet userItemRowSkeleton()}
  <li>
    <div class="p-3 flex flex-col gap-2">
      <div class="bg-gray-300 h-6 w-1/2 rounded-xs animate-pulse"></div>
      <div class="bg-gray-200 h-6 w-1/1 rounded-xs animate-pulse"></div>
      <div class="bg-gray-100 h-6 w-full rounded-xs animate-pulse"></div>
      <div class="bg-gray-50 h-6 w-full rounded-xs animate-pulse"></div>
    </div>
  </li>
{/snippet}

{#snippet thread(cid: number, uid: number)}
  {@const user = userStore.get(uid)}
  <li id={cid.toString()}>
    <a href="/chat/c_{cid}">
      <div
        class="flex items-center hover:bg-gray-100 px-2 py-1"
        style:background-color={`c_${cid}` === urlArray.at(-1) ? "orange" : ""}
      >
        <!-- 1. gender icon -->
        <span><GenderIcon gender={user?.gender} /></span>

        <!-- 2. name -->
        <span class="ml-1">
          {user?.username}
        </span>

        <!-- 3. flag and unreadCount -->
        <div class="ml-auto flex items-center justify-end gap-2">
          <span>{user?.country}</span>
          <span class={` fi fi-${user?.country.toLocaleLowerCase()}`}> </span>

          <!-- {@render unreadCount(user)} -->
        </div>
      </div>
    </a>
  </li>
{/snippet}

{#snippet unreadCount(row: any)}
  <span
    class="w-4 h-4 p-2 rounded-full bg-red-600 flex items-center font-xs justify-center text-white"
    >{row.unreadCount}</span
  >
{/snippet}
