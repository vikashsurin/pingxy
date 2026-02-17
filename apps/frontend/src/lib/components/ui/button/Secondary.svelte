<script lang="ts">
    type ButtonSize = "xs" | "sm" | "md";

    let {
        label,
        fn,
        size = "md",
    }: {
        label: string;
        fn: () => void;
        size: ButtonSize;
    } = $props();

    const fontSizeMap: Record<ButtonSize, string> = {
        md: "1em",
        sm: ".75em",
        xs: ".5em",
    };
</script>

<button
    style:font-size={fontSizeMap[size]}
    onclick={fn}
    class="border border-blue-500 text-blue-500 px-4 py-2 rounded"
>
    {label}
</button>
