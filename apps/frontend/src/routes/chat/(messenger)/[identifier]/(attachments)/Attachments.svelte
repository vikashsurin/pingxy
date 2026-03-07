<script lang="ts">
  import { Camera, Image, Mic, Signature } from "@lucide/svelte";

  let { manager } = $props();

  function handleFileSelection(e: Event) {
    const target = e.currentTarget as HTMLInputElement;
    const selectedFiles = target.files;
    if (!selectedFiles) return;

    Array.from(selectedFiles).forEach((file) => {
      manager.addFile(file);
    });

    target.value = "";
  }
</script>

<div
  class="bg-white p-2 rounded shadow-md border border-gray-200 flex flex-col gap-2"
>
  <!-- 1. Image picker -->
  <label class="p-2 hover:bg-gray-200 rounded cursor-pointer">
    <input
      name="image"
      accept="image/png, image/jpeg, image/gif, image/webp"
      type="file"
      class="hidden"
      onchange={(e) => handleFileSelection(e)}
      multiple
    />
    <Image class="w-6 h-6" />
  </label>

  <!-- 2. Camera (usually capture="environment" or "user") -->
  <label class="p-2 hover:bg-gray-200 rounded cursor-pointer">
    <input
      type="file"
      accept="image/*"
      capture="environment"
      class="hidden"
      onchange={(e) => handleFileSelection(e)}
    />
    <Camera class="w-6 h-6" />
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
