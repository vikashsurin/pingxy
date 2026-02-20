<script lang="ts">
  import { chatStore } from "$lib/store/store.svelte";
  import { clickOutside } from "$lib/utils/clickOutside";
  import { Ban, EllipsisVertical, Eye } from "@lucide/svelte";
  import GenderIcon from "../../routes/chat/GenderIcon.svelte";
  import { blockUser } from "$lib/store/managers/entities/block.svelte";
  import { enhance } from "$app/forms";

  const currentUser = $derived(chatStore.currentUser);
  let isBlocking = $state(false);

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
      style="z-index: 999;"
      use:clickOutside={() => (toggleMenu = false)}
      class="absolute top-full right-0 bg-gray-100 py-1 border mt-1 border-gray-300 min-w-30"
    >
      {@render blockMenuItem()}
      {@render viewMenuItem()}
    </div>
  {/if}
</div>

{#snippet blockMenuItem()}
  <form
    action="?/block"
    method="POST"
    use:enhance={() => {
      isBlocking = true;

      return async ({ result, update }) => {
        if (result.type === "success" && result.data) {
          const actionResult = result.data as {
            success: boolean;
            blocked: { blockedId: number };
          };

          chatStore.blockedUserIds.add(actionResult.blocked.blockedId);
        }
        await update();
        isBlocking = false;
      };
    }}
  >
    <input type="hidden" name="userId" value={partner?.id} />
    <button
      class="flex items-center w-full gap-1.5 py-1 px-3 hover:bg-gray-300"
    >
      <Ban size={14} />
      {#if isBlocking}
        <span>Blocking...</span>
      {:else if chatStore.blockedUserIds.has(partner?.id!)}
        <span>Blocked</span>
      {:else}
        <span>Block</span>
      {/if}
    </button>
  </form>
{/snippet}

{#snippet viewMenuItem()}
  <button class="flex items-center w-full gap-1.5 py-1 px-3 hover:bg-gray-300">
    <Eye size={14} />
    <span>View</span>
  </button>
{/snippet}
