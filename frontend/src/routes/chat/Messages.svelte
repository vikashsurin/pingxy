<script lang="ts">
  let { activeMessages } = $props();
</script>

<ul>
  {#each activeMessages as message}
    <li>
      {#if message.senderName}
        <span class="inline-block font-medium mr-2"
          >{message.senderName} :
        </span>
      {/if}

      {#if message.kind === "system"}
        <span class="inline-block font-medium mr-2 bg-amber-300">
          {message.text}</span
        >
      {:else if message.kind === "chat"}
        <span>{message.text}</span>
      {/if}
    </li>
  {/each}
</ul>
