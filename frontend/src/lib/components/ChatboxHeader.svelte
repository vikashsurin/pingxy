<script lang="ts">
  import { activeChat } from "$lib/store.svelte";
  import { EllipsisVertical } from "@lucide/svelte";
  import GenderIcon from "./GenderIcon.svelte";

  let { user } = $props();
</script>

<div class="flex bg-gray-200 py-1 px-2 shrink-0 text-sm">
  {#if activeChat.value?.uid === "global"}
    <span class="font-bold">Global chat</span>
  {:else}
    <div class="flex w-full items-center gap-2">
      <span> Chatting with : </span>
      <GenderIcon gender={activeChat.value?.gender} />
      <span class=" font-bold">
        {activeChat.value?.username}
        {activeChat.value?.uid === user.uid ? " (You)" : ""}
      </span>
      <span class={`fi fi-${activeChat.value.country.toLocaleLowerCase()}`}
      ></span>
      <EllipsisVertical
        size={24}
        class="hover:bg-gray-300 active:bg-gray-400 p-1 rounded-full ml-auto"
      />
    </div>
  {/if}
</div>
