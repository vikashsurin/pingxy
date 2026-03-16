<script lang="ts">
  import { initSocket } from "$lib/socket/socket.svelte";
  import { conversationStore } from "$lib/stores/conversationStore.svelte.js";
  import { userStore } from "$lib/stores/userStore.svelte.js";
  import { onMount, untrack } from "svelte";
  import Sidebar from "./(sidebar)/Sidebar.svelte";
  let { children, data } = $props();

  $effect.pre(() => {
    untrack(() => {
      userStore.seedFromBlockedUsers(data.blockedUserIds);

      conversationStore.participants = data.conversationData.participants;
      conversationStore.seedFromParticipants(
        data.conversationData.participants,
      );
      conversationStore.seedFromConversations(
        data.conversationData.conversations,
      );

      userStore.seedFromUsers(data.conversationData.users);
    });
  });

  $inspect({ data });

  $inspect({ cp: conversationStore.cp });
  $inspect({ pu: conversationStore.pu });
  $inspect({ uc: conversationStore.uc });
  $inspect({ usersCache: userStore.getUsers() });
  $inspect({ recentChats: conversationStore.recentChats });
  $inspect({ cm: conversationStore.cm });
  $inspect({ convIds: conversationStore.convIds });

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
