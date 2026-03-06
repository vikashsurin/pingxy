<script lang="ts">
  import { userManager } from "$lib/managers/entities/user.svelte";
  import { clickOutside } from "$lib/utils/clickOutside";
  import { CircleChevronDown } from "@lucide/svelte";
  let { username } = $props();
  let expandMenu = $state(false);

  let isMenuExpanded = $state(false);
</script>

<div class="hidden justify-between items-center mx-4 lg:flex py-2 z-100">
  <div class="flex gap-2 text-sm">
    <a href="/" class="font-bold">Logo</a>
    {@render link("/chat/about", "About")}
    {@render link("/chat/contact", "Contact")}
    {@render link("/chat/feedback", "Feedback")}
    {@render link("/chat/support", "Support")}
  </div>

  <div class="flex items-center gap-2 ml-auto">
    You :
    <div class="flex relative items-center gap-1 font-medium">
      <button
        use:clickOutside={() => (isMenuExpanded = false)}
        class="flex items-center gap-1 hover:bg-gray-200 px-3 py-2 rounded active:bg-gray-300"
        onclick={() => (isMenuExpanded = !isMenuExpanded)}
      >
        {username}
        <CircleChevronDown size={16} strokeWidth={2} />
      </button>
      <!-- MENU POPUP -->
      {#if isMenuExpanded}
        <div
          class="absolute py-1 flex flex-col top-full min-w-50 right-0 bg-white border border-gray-200 rounded z-100"
        >
          {@render menuItem("/chat/view-details/me", "View details")}
          {@render menuItem("/chat/upgrade-to-pro", "Upgrade to Pro")}
          {@render menuItem("/chat/settings", "Settings")}
          <a
            title="Logout"
            href="/logout"
            data-sveltekit-preload-data={false}
            onclick={userManager.handlogleLogout}
            class="py-1 px-3 text-red-500 text-sm hover:bg-gray-100 active:text-red-600"
            >Logout</a
          >
        </div>
      {/if}
    </div>
  </div>
</div>

<!-- snippet -->
{#snippet link(url: string, label: string)}
  <a
    href={url}
    class=" hover:text-blue-700 active:text-blue-800 underline active:bg-gray-200"
  >
    {label}
  </a>
{/snippet}

{#snippet menuItem(path: string, label: string)}
  <a
    title="Logout"
    href={path}
    data-sveltekit-preload-data={false}
    class="py-1 px-3 text-gray-700 text-sm hover:bg-gray-100 active:text-blue-800"
    >{label}</a
  >
{/snippet}
