<script>
    import { fileStore } from "$lib/stores/fileStore.svelte";
    import { clickOutside } from "$lib/utils/clickOutside";
    let { src } = $props();
</script>

<div
    class="fixed inset-0 bg-black/60
             flex items-center justify-center p-4"
>
    <div
        class="bg-white rounded-sm shadow-lg w-full max-w-xl
              max-h-[90vh] overflow-auto outline-4 outline-teal-600"
    >
        <img
            {src}
            alt={src}
            use:clickOutside={() => (fileStore.preview = "")}
        />
    </div>
</div>
