<script lang="ts">
    import { initSocket } from "$lib/socket/socket.svelte";
    import { chatStore } from "$lib/store/store.svelte.js";
    import { onMount } from "svelte";
    import Sidebar from "./(sidebar)/Sidebar.svelte";
    let { children, data } = $props();

    $effect.pre(() => {
        data.conversations.forEach((conv) => {
            chatStore._conversations[conv.conversationId] = conv;
        });
    });

    // $inspect({
    //   _conversations: chatStore._conversations,
    // });
    onMount(async () => {
        initSocket();
    });
</script>

<div class="grid grid-cols-12 flex-1 border-5 min-h-0 h-full">
    <Sidebar />
    <div class="col-span-10 border-5 border-green-500 h-full overflow-hidden">
        {@render children()}
    </div>
</div>
