<script lang="ts">
    import { getSocket, initSocket } from "$lib/socket.svelte";
    import { onMount } from "svelte";
    import type { MessagePayload } from "@chat/shared/src/lib/utils/validation";
    import OnlineUsers from "./OnlineUsers.svelte";
    import ChatboxHeader from "./ChatboxHeader.svelte";
    import ChatInput from "./ChatInput.svelte";
    import Sidebar from "./Sidebar.svelte";
    import Chatbox from "./Chatbox.svelte";
    onMount(() => {
        initSocket();
    });
</script>

<div
    class="grid grid-cols-[300px_minmax(900px,1fr)_100px] h-screen overflow-hidden"
>
    <Sidebar />

    <Chatbox />
</div>
