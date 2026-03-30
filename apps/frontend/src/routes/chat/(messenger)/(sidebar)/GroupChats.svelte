<script lang="ts">
  import { Plus } from "@lucide/svelte";
  import CreateGroupModal from "./CreateGroupModal.svelte";
  import { conversationStore } from "$lib/stores/conversationStore.svelte";
  import { page } from "$app/state";

  let activeCid = $derived(page.url.pathname.split("/").at(-1));

  let isOpen = $state(false);
  function handleClick() {
    isOpen = true;
  }

  const groupChats = $derived(conversationStore.groupChats);

  $inspect({ groupChats });
</script>

<h2>Group chat</h2>

<button
  onclick={handleClick}
  class="flex bg-blue-400 w-full items-center justify-center rounded-full py-2 px-3 gap-2 hover:bg-blue-500 transition-colors"
  >Create <Plus size={16} /></button
>

{#each groupChats as g (g.id)}
  <li id={g.id.toString()}>
    <a href={`/chat/g_${g.id}`}>
      <div
        style:background-color={`g_${g.id}` === activeCid ? "orange" : ""}
        class="flex items-center gap-2 hover:bg-gray-100 px-2 py-1"
      >
        {g.name}
      </div>
    </a>
  </li>
{/each}

{#if isOpen}
  <CreateGroupModal bind:isOpen />
{/if}
