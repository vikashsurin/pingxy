<script lang="ts">
  import { fileStore } from "$lib/stores/fileStore.svelte";
  import { clickOutside } from "$lib/utils/clickOutside";
  import { Image, Mic, Signature, Video } from "@lucide/svelte";

  let { showAttachmentsPopup = $bindable() } = $props();

  function handleFileSelection(e: Event) {
    const target = e.currentTarget as HTMLInputElement;
    const selectedFiles = target.files;
    if (!selectedFiles) return;

    fileStore.add(Array.from(selectedFiles));

    target.value = "";
  }
</script>

<div
  class="bg-white p-2 rounded shadow-md border border-gray-200 flex flex-col gap-2"
  use:clickOutside={() => (showAttachmentsPopup = false)}
>
  {#each fileStore.files as f}
    {f.status}
  {/each}
  <!-- 1. Image picker -->
  <label class="p-2 hover:bg-gray-200 rounded cursor-pointer">
    <input
      name="image"
      accept="image/*"
      type="file"
      class="hidden"
      onchange={(e) => handleFileSelection(e)}
      multiple
    />
    <Image class="w-6 h-6" />
  </label>

  <!-- 2. Video (usually capture="environment" or "user") -->
  <label class="p-2 hover:bg-gray-200 rounded cursor-pointer">
    <input
      type="file"
      accept="video/*"
      capture="environment"
      class="hidden"
      onchange={(e) => handleFileSelection(e)}
      multiple
    />
    <Video class="w-6 h-6" />
  </label>

  <!-- 3. Mic / Voice note -->
  <label class="p-2 hover:bg-gray-200 rounded cursor-pointer">
    <input
      type="file"
      accept="audio/*"
      class="hidden"
      onchange={(e) => handleFileSelection(e)}
    />
    <Mic class="w-6 h-6" />
  </label>

  <!-- 4. Drawing (or PDF/image of Drawing) -->
  <label class="p-2 hover:bg-gray-200 rounded cursor-pointer">
    <input
      type="file"
      accept="image/png,image/jpeg,application/pdf"
      class="hidden"
      onchange={(e) => handleFileSelection(e)}
    />
    <Signature class="w-6 h-6" />
  </label>
</div>
