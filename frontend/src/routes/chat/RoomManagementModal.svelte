<script lang="ts">
    import { chatStore } from "$lib/store.svelte.js";
    import { getSocket } from "$lib/socket.svelte.js";
    import type {
        Room,
        User,
    } from "../../../../shared/src/lib/utils/validation.js";

    let { onClose, room } = $props<{ onClose: () => void; room: Room }>();

    let activeTab = $state<"settings" | "members">("settings");

    // Settings State
    let roomName = $state(room.name);
    let description = $state(room.description || "");
    let maxUsers = $state(room.maxUsers || 0);

    // Members State
    // For now, we don't have a list of room members in store.
    // We might need to fetch it? Or rely on "roomUsers" if we build that feature.
    // Let's assume for this MVP we only show "Kick User" by typing ID or selecting from online users in room?
    // Actually, filtering online users by room would be best if we track their location.
    // But standard "Online Users" list doesn't say which room they are in.
    // Let's defer "List Members" and just allow "Delete Room" and "Edit Settings" for now.
    // Kick user can be added if we have a way to list them.

    function saveSettings() {
        const socket = getSocket();
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(
                JSON.stringify({
                    type: "edit_room",
                    roomId: room.uid,
                    name: roomName,
                    description,
                    maxUsers: Number(maxUsers),
                }),
            );
            onClose();
        }
    }

    function deleteRoom() {
        if (!confirm("Are you sure you want to delete this room?")) return;
        const socket = getSocket();
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(
                JSON.stringify({
                    type: "delete_room",
                    roomId: room.uid,
                }),
            );
            onClose();
        }
    }
</script>

<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded shadow-lg w-96">
        <h2 class="text-xl font-bold mb-4">Manage Room</h2>

        <!-- TABS -->
        <div class="flex gap-4 border-b mb-4">
            <button
                class={`pb-2 ${activeTab === "settings" ? "border-b-2 border-blue-500 font-bold" : ""}`}
                onclick={() => (activeTab = "settings")}>Settings</button
            >
            <!-- <button 
            class={`pb-2 ${activeTab === 'members' ? 'border-b-2 border-blue-500 font-bold' : ''}`}
            onclick={() => activeTab = 'members'}
        >Members</button> -->
        </div>

        {#if activeTab === "settings"}
            <label class="block mb-2 text-sm font-bold">Room Name</label>
            <input
                bind:value={roomName}
                class="w-full p-2 border rounded mb-4"
            />

            <label class="block mb-2 text-sm font-bold">Description</label>
            <input
                bind:value={description}
                class="w-full p-2 border rounded mb-4"
            />

            <label class="block mb-2 text-sm font-bold"
                >Max Users (0 for unlimited)</label
            >
            <input
                type="number"
                bind:value={maxUsers}
                class="w-full p-2 border rounded mb-4"
            />

            <div class="flex justify-between mt-6">
                <button
                    onclick={deleteRoom}
                    class="px-4 py-2 text-red-600 hover:bg-red-50 rounded border border-red-200"
                    >Delete Room</button
                >
                <div class="flex gap-2">
                    <button
                        onclick={onClose}
                        class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                        >Cancel</button
                    >
                    <button
                        onclick={saveSettings}
                        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >Save</button
                    >
                </div>
            </div>
        {/if}
    </div>
</div>
