<script>
    import { fileStore } from "$lib/stores/fileStore.svelte.js";
    import { X } from "@lucide/svelte";

    let { file, callback } = $props();

    // let fileType = $derived.by(() => {
    //     let type = file.file.type;
    //     if (type) {
    //         return type.split("/")[0];
    //     }
    // });

    $inspect("xx", file.type);
</script>

<div
    class="thumb group flex flex-col gap-2 items-center justify-center p-2 bg-white rounded border border-gray-300"
>
    {#if file.type.startsWith("image")}
        {@render image()}
    {:else if file.type.startsWith("video")}
        {@render video()}
    {:else if file.type.startsWith("pdf")}
        <!-- {@render pdf()} -->
    {/if}
    <div class="flex flex-col gap-2 items-center text-xs">
        <div class="flex w-full items-center justify-between">
            <span>{file.progress}%</span>
            <span>{file.size}</span>
            <X
                size={18}
                class="hover:bg-gray-300 rounded p-0.5"
                onclick={callback}
            />
        </div>

        <progress
            class="h-2 rounded bg-white w-30"
            value={file.progress}
            max="100"
        ></progress>
    </div>
</div>

{#snippet image()}
    <button
        title={file.id}
        class="hover:outline-3 outline-teal-500"
        onclick={() => (fileStore.preview = file.previewUrl)}
    >
        <img
            src={file.previewUrl}
            alt=""
            style:height="5em"
            style:width="auto"
        />
    </button>
{/snippet}

{#snippet video()}
    <button title={file.id} class="hover:outline-3 outline-teal-500">
        <video
            src={file.previewUrl}
            style:height="5em"
            style:width="auto"
            muted
            playsinline
            controls
        ></video>
    </button>
{/snippet}
