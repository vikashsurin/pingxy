<script lang="ts">
  import { Camera, Image, Mic, Signature } from "@lucide/svelte";

  let { onAttachment } = $props<{ onAttachment: (file: File) => void }>();

  // Correct init: undefined or null is the right "no files" state
  let files = $state<FileList | undefined>(undefined);

  // This effect WILL react to changes in files
  // $effect(() => {
  //   // Force read of files (establishes dependency even when undefined)
  //   console.log("Effect running — files changed or initial:", files);

  //   if (files?.length) {
  //     const file = files[0]; // or loop over files if you support multiple
  //     console.log(`${file.name}: ${file.size} bytes, type: ${file.type}`);

  //     onAttachment(file);

  //     // Optional but recommended: reset so same file can be re-selected
  //     // (browsers don't fire change event if you pick the exact same file again)
  //     files = undefined;
  //   }
  // });

  function handleChange(e: Event) {
    console.log("fired");
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    console.log(`${file.name}: ${file.size} bytes, type: ${file.type}`);
    onAttachment(file);
    input.value = ""; // reset so same file can be re-selected
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
      onchange={handleChange}
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
      bind:files
    />
    <Camera class="w-6 h-6" />
  </label>

  <!-- 3. Mic / Voice note -->
  <label class="p-2 hover:bg-gray-200 rounded cursor-pointer">
    <input type="file" accept="audio/*" class="hidden" bind:files />
    <Mic class="w-6 h-6" />
  </label>

  <!-- 4. Signature / drawing? (or PDF/image of signature) -->
  <label class="p-2 hover:bg-gray-200 rounded cursor-pointer">
    <input
      type="file"
      accept="image/png,image/jpeg,application/pdf"
      class="hidden"
      bind:files
    />
    <Signature class="w-6 h-6" />
  </label>
</div>

{#if files?.length}
  <div class="mt-2 text-sm text-gray-600">
    Selected: {files[0].name} ({(files[0].size / 1024).toFixed(1)} KB)
  </div>
{/if}
