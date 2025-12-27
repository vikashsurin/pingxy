<script lang="ts">
  import { Search } from "@lucide/svelte";
  import { chatStore } from "$lib/store.svelte";

  let { handleGenderFilter = $bindable() } = $props();

  let isSearchExapanded = $state(false);

  let searchInput: HTMLInputElement | undefined = $state();

  $effect(() => {
    if (isSearchExapanded) {
      searchInput?.focus();
    }
  });

  function handleInput(
    e: Event & { currentTarget: EventTarget & HTMLInputElement }
  ) {
    const target = e.target as HTMLInputElement;
    chatStore.searchQuery.value = target.value;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      if (chatStore.searchQuery.value === "") {
        isSearchExapanded = false;
      }
    }
  }
</script>

<div class=" flex items-center justify-between bg-gray-200 py-2 px-3 shrink-0">
  <form action="" class="text-xs flex items-center gap-2">
    <label class="flex items-center gap-1">
      <input
        name="gender"
        onchange={(e) => handleGenderFilter(e)}
        type="radio"
        value="all"
        checked
        title="Show all users"
      />
      All
    </label>
    <label class="flex items-center gap-1">
      <input
        name="gender"
        onchange={(e) => handleGenderFilter(e)}
        type="radio"
        value="female"
        title="Show only female users"
      />
      Female
    </label>
    <label class="flex items-center gap-1">
      <input
        name="gender"
        onchange={(e) => handleGenderFilter(e)}
        type="radio"
        value="male"
        title="Show only male users"
      />
      Male
    </label>
  </form>

  <Search
    size={24}
    class="text-gray-400 hover:text-blue-500 active:text-white active:bg-blue-600 {isSearchExapanded
      ? 'bg-blue-500 text-white hover:text-white '
      : ''} p-1 rounded-full"
    onclick={() => {
      isSearchExapanded = !isSearchExapanded;
    }}
  />
</div>

<!-- Search user -->
{#if isSearchExapanded}
  <div>
    <form action="" class="p-1">
      <input
        bind:this={searchInput}
        type="search"
        oninput={(e) => handleInput(e)}
        class="border-2 w-full p-1 border-blue-600"
        onkeydown={(e) => handleKeydown(e)}
      />
    </form>
  </div>
{/if}
