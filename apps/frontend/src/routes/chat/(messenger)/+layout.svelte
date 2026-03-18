<script lang="ts">
  import { initSocket } from "$lib/socket/socket.svelte";
  import { conversationStore } from "$lib/stores/conversationStore.svelte.js";
  import { userStore } from "$lib/stores/userStore.svelte.js";
  import { onMount, untrack } from "svelte";
  import Sidebar from "./(sidebar)/Sidebar.svelte";

  let { children, data } = $props();

  $inspect({ data });

  $effect.pre(() => {
    untrack(() => {
      userStore.seedFromBlockedUsers(data.blockedUserIds);

      conversationStore.participants = data.conversationData.participants;

      conversationStore.seedFromConversations(
        data.conversationData.conversations,
      );

      conversationStore.seedFromParticipants(
        data.conversationData.participants,
      );

      userStore.seedFromUsers(data.conversationData.users);
    });
  });

  $inspect({ chatState: conversationStore.chatState });

  onMount(async () => {
    initSocket();
  });
</script>

<div class="grid grid-cols-12 flex-1 border-5 min-h-0 h-full">
  <Sidebar />
  <div class="col-span-9 border-5 border-green-500 h-full overflow-hidden">
    {@render children()}
  </div>
</div>
