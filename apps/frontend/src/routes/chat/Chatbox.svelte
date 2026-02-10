<script lang="ts">
  import ChatboxHeader from "./ChatboxHeader.svelte";
  import InfiniteScrollChat from "./InfiniteScrollChat.svelte";
  import ChatInput from "./ChatInput.svelte";
</script>

<div class="flex flex-col h-full overflow-hidden">
  <ChatboxHeader />
  <InfiniteScrollChat />
  <ChatInput />
</div>
