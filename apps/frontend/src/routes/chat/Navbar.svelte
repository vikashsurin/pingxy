<script lang="ts">
  import { clickOutside } from "$lib/utils/clickOutside";
  import {
    ChevronDown,
    CircleChevronDown,
    CircleUserRound,
    Menu,
    X,
  } from "@lucide/svelte";
  let { username } = $props();
  let expandMenu = $state(false);

  let isMenuExpanded = $state(false);
</script>

<!-- FOR MOBILE -->
<div class="lg:hidden justify-between items-center">
  <div class="relative flex w-full justify-between items-center">
    <a href="/" class="font-bold text-2xl">Logo</a>
    {#if expandMenu}
      <X onclick={() => (expandMenu = false)} class="ml-auto" />
    {:else}
      <Menu onclick={() => (expandMenu = true)} class="ml-auto" />
    {/if}
    {#if expandMenu}
      <div
        class="absolute w-full flex-1 left-0 right-0 top-full bg-amber-500 z-999 h-dvh p-6"
      >
        <div class="flex flex-col gap-2 text-sm">
          {@render link("/about", "About")}
          {@render link("/contact", "Contact")}
          {@render link("/feedback", "Feedback")}
          {@render link("/support", "Support")}

          <p class="text-md mt-4">
            Logged in as
            <span class="text-green-600 font-bold">
              <CircleUserRound />
              {username}
            </span>
          </p>
          <a
            href="/chat/logout"
            data-sveltekit-preload-data={false}
            class="underline text-red-500 hover:text-red-500 active:text-red-700"
            >Logout</a
          >
        </div>
      </div>
    {/if}
  </div>
</div>

<!-- FOR DESKTOP -->
<div class="hidden justify-between items-center mx-4 lg:flex py-2">
  <div class="flex gap-2 text-sm">
    <a href="/" class="font-bold">Logo</a>
    {@render link("/about", "About")}
    {@render link("/contact", "Contact")}
    {@render link("/feedback", "Feedback")}
    {@render link("/support", "Support")}
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
          class="absolute py-1 flex flex-col top-full min-w-50 right-0 bg-white border border-gray-200 rounded"
        >
          {@render menuItem("/chat/view-details/me", "View details")}
          {@render menuItem("/chat/upgrade-to-pro", "Upgrade to Pro")}
          {@render menuItem("/chat/settings", "Settings")}
          <a
            title="Logout"
            href="/chat/logout"
            data-sveltekit-preload-data={false}
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
