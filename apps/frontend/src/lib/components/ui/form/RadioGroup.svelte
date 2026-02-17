<script lang="ts">
  let { label, options } = $props<{
    label: string;
    options: {
      id: string | number;
      label: string;
      value: string;
      name: string;
    }[];
  }>();

  let selected = $state("");

  function handleChange(e: Event) {
    const target = e.target as HTMLInputElement;
    selected = target.value;
  }
</script>

<div role="group" aria-label={label} class="flex flex-col gap-1">
  <span class="ml-1 text-sm">{label}</span>
  <div class="flex items-center gap-2">
    {#each options as item}
      <label
        class="flex items-center gap-2 border border-sky-200 rounded w-full px-3 py-2 cursor-pointer bg-sky-50"
      >
        <input
          id={item.id}
          type="radio"
          name={item.name}
          value={item.value}
          checked={selected === item.value}
          onchange={(e) => handleChange(e)}
        />
        <span class="text-sm">{item.label}</span>
      </label>
    {/each}
  </div>
</div>
