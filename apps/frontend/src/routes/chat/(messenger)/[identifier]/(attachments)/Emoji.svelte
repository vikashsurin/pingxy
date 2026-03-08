<script lang="ts">
    let {
        char,
        hex,
        size = "1.5rem",
    } = $props<{
        char: string;
        hex?: string;
        size?: string;
    }>();

    const getHexCode = (emoji: string) => {
        return Array.from(emoji)
            .map((s) => s.codePointAt(0)?.toString(16))
            .filter((h) => h && h !== "fe0f") // Remove the variation selector
            .join("-");
    };

    // Use the provided hex, otherwise calculate it
    const finalHex = $derived(hex ? hex.toLowerCase() : getHexCode(char));

    const emojiUrl = $derived(
        `https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/svg/${finalHex}.svg`,
    );
</script>

<img
    src={emojiUrl}
    alt={char}
    style:width={size}
    style:height={size}
    class="inline-block align-middle pb-1"
    loading="lazy"
/>
