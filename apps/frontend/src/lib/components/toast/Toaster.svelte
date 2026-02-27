<script lang="ts">
  import { fly } from "svelte/transition";
  import { toasts, remove } from "./toast.svelte.ts";
</script>

{#each toasts as toast (toast.id)}
  <div
    transition:fly={{ y: -20, duration: 300 }}
    class="fixed top-4 right-4 z-50 flex w-80 max-w-full flex-col gap-2"
  >
    <div
      class="rounded-lg border p-4 shadow-lg text-white flex items-start gap-3"
      class:bg-green-600={toast.type === "success"}
      class:bg-red-600={toast.type === "error"}
      class:bg-blue-600={toast.type === "info"}
      class:bg-amber-600={toast.type === "warning"}
    >
      <span class="flex-1">{toast.message}</span>
      <button
        on:click={() => remove(toast.id)}
        class="opacity-80 hover:opacity-100 text-lg leading-none"
      >
        ×
      </button>
    </div>
  </div>
{/each}
