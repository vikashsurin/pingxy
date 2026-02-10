<script lang="ts">
  import { chatStore } from "$lib/store/store.svelte";
  import {
    Ban,
    EllipsisVertical,
    Eye,
    type Icon as IconType,
  } from "@lucide/svelte";
  import GenderIcon from "../../routes/chat/GenderIcon.svelte";
  import { clickOutside } from "$lib/utils/clickOutside";

  const currentUser = $derived(chatStore.currentUser);

  const partner = $derived(chatStore.target?.user);
  let toggleMenu = $state(false);
</script>

<div class="flex relative bg-gray-200 py-1 px-2 shrink-0 text-sm">
  {#if chatStore.target}
    <div class="flex w-full items-center gap-2">
      <span> Chatting with : </span>

      <GenderIcon gender={partner?.data.gender} />
      <span class=" font-bold">
        {partner?.username}
        {partner?.id === currentUser?.id ? " (You)" : ""}
      </span>

      {#if partner?.data.country && partner?.data.country !== "0"}
        <span class={`fi fi-${partner?.data.country.toLocaleLowerCase()}`}
        ></span>
      {/if}
      <span></span>

      <EllipsisVertical
        size={24}
        class="hover:bg-gray-300 active:bg-gray-400 {toggleMenu
          ? 'bg-gray-300'
          : ''} p-1 rounded-full ml-auto"
        onclick={() => (toggleMenu = !toggleMenu)}
      />
    </div>
  {/if}
  {#if toggleMenu}
    <div
      use:clickOutside={() => (toggleMenu = false)}
      class="absolute top-full right-0 bg-gray-100 py-1 border mt-1 border-gray-300 min-w-30"
    >
      {@render menuItem(Ban, "Block")}
      {@render menuItem(Eye, "View")}
    </div>
  {/if}
</div>

{#snippet menuItem(Icon: typeof IconType, label: string)}
  <button class="flex items-center w-full gap-1.5 py-1 px-3 hover:bg-gray-300">
    <Icon size={14} />
    <span>{label}</span>
  </button>
{/snippet}
