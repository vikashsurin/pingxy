<script lang="ts">
    import { getSocket } from "$lib/socket.svelte.js";
    import type { Room } from "../../../../shared/src/lib/utils/validation.js";

    let { onClose } = $props();
    let roomName = $state("");
    let description = $state("");
    let type = $state<"public" | "private">("public");

    function createRoom() {
        if (!roomName.trim()) return;

        const socket = getSocket();
        if (socket && socket.readyState === WebSocket.OPEN) {
            const room: Partial<Room> = {
                uid: crypto.randomUUID(),
                name: roomName,
                description: description,
                type: type,
            };

            socket.send(
                JSON.stringify({
                    type: "create_room",
                    room,
                }),
            );
            onClose();
        }
    }
</script>

<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded shadow-lg w-96">
        <h2 class="text-xl font-bold mb-4">Create Room</h2>

        <label class="block mb-2 text-sm font-bold">Room Name</label>
        <input
            bind:value={roomName}
            class="w-full p-2 border rounded mb-4"
            placeholder="e.g. Tech Talk"
        />

        <label class="block mb-2 text-sm font-bold">Description</label>
        <input
            bind:value={description}
            class="w-full p-2 border rounded mb-4"
            placeholder="Optional description"
        />

        <div class="flex justify-end gap-2">
            <button
                onclick={onClose}
                class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >Cancel</button
            >
            <button
                onclick={createRoom}
                class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >Create</button
            >
        </div>
    </div>
</div>
