<script lang="ts">
  import { getSocket, initSocket } from "$lib/socket.svelte";
  import { onMount } from "svelte";
  import type { SocketMessage } from "@chat/shared/src/lib/utils/validation";
  import OnlineUsers from "./OnlineUsers.svelte";
  import ChatboxHeader from "./ChatboxHeader.svelte";
  import ChatInput from "./ChatInput.svelte";

  onMount(() => {
    initSocket();
  });
</script>

<div
  class=" flex-col h-full overflow-hidden lg:flex sm:hidden md:hidden hidden"
>
  <div
    class="grid lg:grid-cols-[auto_1fr_auto] md:grid-cols-[auto_3fr] sm:grid-cols-1 h-full gap-2"
  >
    <!-- ONLINE USERS -->
    <OnlineUsers />

    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Chatting with -->
      <ChatboxHeader />

      <!-- CHAT MESSAGES -->
      <!-- {#key chatStore.activeChatTarget?.uid}
        <Messages user={chatStore.currentUser!} {activeMessages} />
      {/key} -->

      <!-- MESSAGE INPUT BOX -->
      <ChatInput />
    </div>

    <!-- ADS SECTION -->
    <div class="w-80 bg-gray-100">ADS</div>
  </div>
</div>
