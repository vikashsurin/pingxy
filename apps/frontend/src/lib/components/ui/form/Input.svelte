<script lang="ts">
  import type { IconProps } from "@lucide/svelte";
  import type { Component } from "svelte";

  let {
    label,
    name,
    value = $bindable(),
    type = "text",
    icon,
    toggleIcon,
    placeholder,
  }: {
    label: string;
    name: string;
    placeholder: string;
    value: string;
    type?: string;
    icon?: Component<IconProps>;
    toggleIcon?: Component<IconProps>;
  } = $props();

  let isVisible = $state(false);

  let displayType = $derived(type === "password" && isVisible ? "text" : type);

  function handleToggle() {
    if (type === "password") {
      isVisible = !isVisible;
    }
  }
</script>

<label for={name} class=" relative flex flex-col gap-1 text-md w-full">
  <span class="ml-1 text-sm">{label}</span>
  <div class="relative">
    <input
      type={displayType}
      {name}
      {placeholder}
      bind:value
      class="border border-sky-200 text-sky-600 rounded px-3 py-2 text-md w-full bg-sky-50"
    />
    {#if icon}
      {@const Icon = isVisible ? toggleIcon : icon}
      <Icon
        id="icon"
        size={14}
        onclick={() => handleToggle()}
        class="absolute top-1/2 transform -translate-y-1/2 right-2 text-sky-400"
      />
    {/if}
  </div>
</label>
