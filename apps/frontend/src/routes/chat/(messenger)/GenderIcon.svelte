<script lang="ts">
  import { Mars, Venus } from "@lucide/svelte";
  let { gender }: { gender: string | undefined } = $props();
</script>

<span>
  {#if gender === "male"}
    <Mars size={14} class="text-blue-500" strokeWidth={3} />
  {:else if gender === "female"}
    <Venus size={14} class="text-pink-500" strokeWidth={3} />
  {/if}
</span>
