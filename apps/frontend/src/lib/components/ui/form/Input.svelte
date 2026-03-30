<script lang="ts">
  import { CircleCheck, Info, type IconProps } from "@lucide/svelte";
  import type { Component } from "svelte";
  import type { HTMLInputAttributes } from "svelte/elements";

  interface Props extends HTMLInputAttributes {
    label: string;
    name: string;
    placeholder?: string;
    value: string;
    type?: "text" | "password" | "email" | "number" | string; // Stronger typing
    icon?: Component<IconProps>;
    toggleIcon?: Component<IconProps>;
    oninput?: (event: Event) => void;
    errText?: string;
    okText?: string;
  }

  let {
    label,
    name,
    value = $bindable(),
    type = "text",
    icon,
    toggleIcon,
    placeholder,
    oninput,
    errText,
    okText,
    ...rest
  }: Props = $props();

  let isVisible = $state(false);

  // Only switch to text if it started as a password
  let displayType = $derived(type === "password" && isVisible ? "text" : type);

  const isPassword = $derived(type === "password");

  function handleToggle() {
    isVisible = !isVisible;
  }
</script>

<label for={name} class="relative flex flex-col gap-1 w-full text-sky-900">
  <div class="flex justify-between">
    <span class="ml-1 text-sm font-medium">{label}</span>

    {#if errText && errText?.length > 0}
      <span class="flex gap-1 justify-center items-center text-red-500 text-xs">
        {errText}
        <Info size={12} />
      </span>
    {:else if okText && okText?.length > 0}
      <span
        class="flex gap-1 justify-center items-center text-green-500 text-xs"
      >
        {okText}
        <CircleCheck size={12} />
      </span>
    {:else}
      <span class="text-gray-500 text-xs">{errText ?? okText ?? ""}</span>
    {/if}
  </div>

  <div class="relative group">
    <input
      bind:value
      id={name}
      {name}
      {placeholder}
      {oninput}
      type={displayType}
      {...rest}
      class="w-full rounded border border-sky-200 bg-sky-50 px-3 py-2 text-md text-sky-600 outline-none transition-colors focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
    />

    {#if icon}
      {@const CurrentIcon = isVisible ? toggleIcon : icon}
      {@const StaticIcon = icon}
      <div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
        {#if isPassword && toggleIcon}
          <button
            type="button"
            onclick={handleToggle}
            class="p-1 text-sky-400 hover:text-sky-600 hover:bg-sky-100 rounded focus:outline-none bg-sky-50"
            aria-label={isVisible ? "Hide password" : "Show password"}
          >
            <CurrentIcon size={18} />
          </button>
        {:else}
          <div class="pointer-events-none bg-sky-50 rounded p-1 text-sky-400">
            <StaticIcon size={18} />
          </div>
        {/if}
      </div>
    {/if}
  </div>
</label>
