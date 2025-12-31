<script lang="ts">
  import { getSocket } from "$lib/socket.svelte.js";
  import { chatStore } from "$lib/store.svelte.js";

  type Props = {
    onClose: () => void;
    roomId: string;
    roomName: string;
  };

  let { onClose, roomId, roomName }: Props = $props();

  let password = $state("");
  let error = $state("");

  function joinRoom() {
    if (!password.trim()) {
      error = "Password required";
      return;
    }

    const socket = getSocket();
    if (socket && socket.readyState === WebSocket.OPEN) {
      chatStore.unlockedRooms.set(roomId, password);
      socket.send(
        JSON.stringify({
          type: "join_room",
          roomId,
          password,
        })
      );
      onClose();
    }
  }
</script>

<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
  <div class="bg-white p-6 rounded shadow-lg w-80">
    <h2 class="text-xl font-bold mb-4">Join {roomName}</h2>
    <p class="text-sm text-gray-600 mb-4">
      This room is private. Please enter the password.
    </p>

    <input
      type="password"
      bind:value={password}
      class="w-full p-2 border rounded mb-2"
      placeholder="Password"
      onkeydown={(e) => e.key === "Enter" && joinRoom()}
    />
    {#if error}
      <p class="text-red-500 text-xs mb-2">{error}</p>
    {/if}

    <div class="flex justify-end gap-2 mt-4">
      <button
        onclick={onClose}
        class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button
      >
      <button
        onclick={joinRoom}
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >Join</button
      >
    </div>
  </div>
</div>
