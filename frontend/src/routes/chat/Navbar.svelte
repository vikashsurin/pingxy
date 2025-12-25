<script lang="ts">
  import { Menu, X } from "@lucide/svelte";
  let { username } = $props();
  let expandMenu = $state(false);
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

  <div class="ml-auto">
    You :
    <span class="text-green-600 font-bold">
      {username}
    </span>

    <a
      title="Logout"
      href="/chat/logout"
      data-sveltekit-preload-data={false}
      class="underline p-2 text-red-600 hover:text-red-500 active:text-red-700"
      >Logout</a
    >
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
