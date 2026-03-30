<script lang="ts">
  type ButtonSize = "xs" | "sm" | "md";

  let {
    label,
    fn,
    size = "md",
    loading = false,
  }: {
    label: string;
    fn: () => void;
    size?: ButtonSize;
    loading?: boolean;
  } = $props();

  const fontSizeMap: Record<ButtonSize, string> = {
    md: "1em",
    sm: ".75em",
    xs: ".5em",
  };
</script>

<!-- <button
    style:font-size={fontSizeMap[size]}
    onclick={fn}
    class="bg-blue-500 text-white px-4 py-2 rounded"
>
    {label}
</button> -->

<button
  disabled={loading}
  class="bg-sky-600 text-white p-2.5 rounded font-medium hover:bg-sky-700 active:bg-sky-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
  style:font-size={fontSizeMap[size]}
  onclick={fn}
>
  {#if loading}
    <svg
      class="animate-spin h-4 w-4 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle>
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
    Processing...
  {:else}
    {label}
  {/if}
</button>
