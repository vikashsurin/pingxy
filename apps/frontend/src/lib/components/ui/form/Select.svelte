<script lang="ts">
  import { ChevronsUpDown } from "@lucide/svelte";

  let {
    label,
    name,
    options,
    value = $bindable(),
  } = $props<{
    label: string;
    name: string;
    options: {
      value?: string | number;
      code?: string | number;
      name: string | number;
    }[];
    value: string | number;
  }>();
</script>

<label for={name} class="relative flex flex-col gap-1 text-md w-full">
  <span class="ml-1 text-sm">{label}</span>
  <div class="select-container relative">
    <select
      {name}
      bind:value
      class="border border-sky-200 rounded p-2 text-md w-full bg-sky-50"
    >
      {#each options as option}
        <option value={option.value ?? option.code}>{option.name}</option>
      {/each}
    </select>
    <ChevronsUpDown
      size={14}
      class="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-sky-600"
    />
  </div>
</label>

<style>
  select {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    position: relative;
  }
</style>
