<script lang="ts">
  let { char, size = "1.5rem" } = $props<{ char: string; size?: string }>();

  // Helper to get the hex code of the emoji for the CDN URL
  const getHexCode = (emoji: string) => {
    return Array.from(emoji)
      .map((s) => s.codePointAt(0)?.toString(16))
      .filter(Boolean)
      .join("-");
  };

  const emojiUrl = $derived(
    `https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/svg/${getHexCode(char)}.svg`,
  );
</script>

<img
  src={emojiUrl}
  alt={char}
  style:width={size}
  style:height={size}
  class="inline-block align-middle pb-1"
/>
