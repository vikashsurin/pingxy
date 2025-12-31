<script lang="ts">
  import type {
    User,
    ChatTarget,
    Room,
  } from "../../../../shared/src/lib/utils/validation.js";
  import { chatStore } from "$lib/store.svelte.js";
  import GenderIcon from "./GenderIcon.svelte";
  import {
    ChevronDown,
    ChevronUp,
    MessageSquare,
    Hash,
    Lock,
    Settings2,
  } from "@lucide/svelte";
  import SidebarHeader from "./SidebarHeader.svelte";
  import CreateRoomModal from "./CreateRoomModal.svelte";
  import RoomManagementModal from "./RoomManagementModal.svelte";
  import JoinRoomModal from "./JoinRoomModal.svelte";
  import { getSocket } from "$lib/socket.svelte.js";
  import { onMount } from "svelte";

  let { user: me, users } = $props();

  let isExpandedRecentChats = $state(false);
  let filterGender = $state("all");
  let showCreateRoomModal = $state(false);
  let showJoinRoomModal = $state(false);
  let selectedRoomForManagement = $state<ChatTarget | null>(null);
  let selectedRoomToJoin = $state<ChatTarget | null>(null);
  let selectedTab = $state("1");

  let usersCount = $derived.by(() => {
    return users.size - 1;
  });

  let sortedUsers = $derived.by(() => {
    if (!users || users.size === 0) return [];

    const searchLower = chatStore.searchQuery.value.trim().toLowerCase();

    return Array.from<User>(users.values())
      .filter((usr) => {
        if (chatStore.recentChatIds.has(usr.uid)) return false;
        if (filterGender !== "all" && usr.gender !== filterGender) return false;
        if (searchLower && !usr.username.toLowerCase().includes(searchLower))
          return false;
        return true;
      })
      .sort((a, b) => a.country.localeCompare(b.country));
  });

  let sortedRooms = $derived.by(() => {
    return Array.from(chatStore.rooms.values()).sort((a, b) => {
      if (a.uid === "global") return -1;
      if (b.uid === "global") return 1;
      return a.name.localeCompare(b.name);
    });
  });

  let joinRoomName = $derived(
    selectedRoomToJoin && "type" in selectedRoomToJoin
      ? (selectedRoomToJoin as any).name
      : ""
  );

  // const genderFilter
  function handleGenderFilter(e: Event & { target: HTMLInputElement }) {
    filterGender = e.target.value;
  }
  onMount(() => {
    const joinedRooms = sessionStorage.getItem("joinedRooms");
    const socket = getSocket();
    if (joinedRooms) {
      try {
        const roomIds: string[] = JSON.parse(joinedRooms);
        roomIds.forEach((roomId) => {
          if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(
              JSON.stringify({
                type: "rejoin_room",
                roomId,
              })
            );
          }
          chatStore.joinedRooms.add(roomId);
        });
      } catch (e) {
        console.error("Failed to parse joinedRooms from sessionStorage", e);
      }
    }
  });
  $effect(() => {
    const joinedRooms = chatStore.joinedRooms;
    sessionStorage.setItem(
      "joinedRooms",
      JSON.stringify(Array.from(joinedRooms))
    );
  });

  onMount(() => {
    const joinedRooms = sessionStorage.getItem("joinedRooms");
    const socket = getSocket();
    if (socket) {
      console.log({ socket });
      if (joinedRooms) {
        const roomIds: string[] = JSON.parse(joinedRooms);
        roomIds.forEach((roomId) => {
          if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(
              JSON.stringify({
                type: "join_room",
                roomId,
              })
            );
          }
          chatStore.joinedRooms.add(roomId);
        });
      }
    }
  });
  function handleClick(target: ChatTarget) {
    if (!target) return;
    chatStore.activeChatTarget = target;

    // If room, ensure we join/fetch history
    if ("type" in target) {
      if (target.type === "private") {
        const isCreator = target.createdBy === me?.uid;
        const cachedPassword = chatStore.unlockedRooms.get(target.uid);

        if (isCreator || cachedPassword) {
          // Join directly (backend handles creator bypass, or we send cached pw)
          const socket = getSocket();
          if (socket?.readyState === WebSocket.OPEN) {
            socket.send(
              JSON.stringify({
                type: "join_room",
                roomId: target.uid,
                password: cachedPassword, // If creator, this is undefined/null, but backend bypasses. If cached, it's sent.
              })
            );
          }
          return;
        }

        // If I am not creator AND no cached password -> prompt
        selectedRoomToJoin = target;
        showJoinRoomModal = true;
        return;
      }

      const socket = getSocket();
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "join_room", roomId: target.uid }));
      }
    }
  }

  function handleJoinRoom(room: Room) {
    if (room.type === "private") {
      if (room.createdBy === me?.uid) {
        // do something
        // join the room when the component is loaded as creator
      } else {
        console.log("not creator");
        selectedRoomToJoin = room;
        showJoinRoomModal = true;
      }
    }

    if (room.type === "public") {
      // chatStore.joinedRooms.add(room.uid);

      const socket = getSocket();
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: "join_room",
            roomId: room.uid,
          })
        );
      }
    }
    return;
  }

  function handlLeaveRoom(room: Room) {
    chatStore.joinedRooms.delete(room.uid);
    const socket = getSocket();
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "leave_room",
          roomId: room.uid,
        })
      );
    }
    return;
  }

  onMount(() => {
    sortedRooms.forEach((room) => {
      if (room.createdBy === me?.uid) {
        const socket = getSocket();
        if (socket?.readyState === WebSocket.OPEN) {
          socket.send(
            JSON.stringify({
              type: "join_room",
              roomId: room.uid,
            })
          );
        }
        chatStore.joinedRooms.add(room.uid);
      }
    });
  });
  // Testing auto join for owner
  function ownerAutoRoomJoin() {}
</script>

{#if showCreateRoomModal}
  <CreateRoomModal onClose={() => (showCreateRoomModal = false)} />
{/if}

{#if showJoinRoomModal && selectedRoomToJoin}
  <JoinRoomModal
    roomId={selectedRoomToJoin.uid}
    roomName={selectedRoomToJoin.name}
    onClose={() => {
      showJoinRoomModal = false;
      selectedRoomToJoin = null;
    }}
  />
{/if}

{#if selectedRoomForManagement && "type" in selectedRoomForManagement}
  <RoomManagementModal
    room={selectedRoomForManagement}
    onClose={() => (selectedRoomForManagement = null)}
  />
{/if}

<!-- USERS -->
<div class="bg-gray-100 min-w-75 flex flex-col overflow-hidden">
  <div class="flex flex-col overflow-hidden flex-1">
    <!-- Filter, Search -->
    <SidebarHeader {handleGenderFilter} />
    <ul class="flex-1 overflow-y-auto">
      <div>
        <button
          class="flex w-full text-sm items-center bg-gray-300 hover:bg-gray-400 justify-between py-2 px-3"
          title="Toggle Recent Chats"
          onclick={() => (isExpandedRecentChats = !isExpandedRecentChats)}
        >
          <div class="flex items-center gap-2">
            <MessageSquare size={14} />
            <span>Recent Chats</span>
            {#if chatStore.unread.size > 0}
              <span class="w-2 h-2 rounded-full bg-red-600 animate-pulse"
              ></span>
            {/if}
          </div>
          {#if isExpandedRecentChats}
            <ChevronUp size={24} class="p-1" />
          {:else}
            <ChevronDown size={24} class="p-1" />
          {/if}
        </button>
        {#if isExpandedRecentChats}
          <!-- RECENT CHATS -->
          <div class="bg-amber-50">
            {#each chatStore.recentChats as target (target.uid)}
              <!-- {@render itemRow(target)} -->
            {/each}
          </div>
        {/if}
      </div>
      <!-- Separator -->
      <div class="border border-gray-700 my-2"></div>

      <!-- TABS -->
      <div class="flex items-center">
        <div class="flex w-full items-center justify-center">
          <button
            class="px-2 py-1 w-full hover:bg-gray-300 relative border-gray-200 {selectedTab ===
            '0'
              ? 'bg-gray-400'
              : ''}"
            onclick={() => (selectedTab = "0")}>Users</button
          >
        </div>
        <div class="flex w-full items-center justify-center">
          <button
            class="px-2 py-1 w-full hover:bg-gray-300 relative border-gray-200 {selectedTab ===
            '1'
              ? 'bg-gray-400'
              : ''}"
            onclick={() => (selectedTab = "1")}>Rooms</button
          >
        </div>
      </div>

      {#if selectedTab === "0"}
        <!-- RENDER ONLINE USERS LIST -->
        {#each sortedUsers as user (user.uid)}
          {@render userItemRow(user)}
        {/each}
        <!-- RENDER ROOMS LIST -->
      {:else if selectedTab === "1"}
        <div class="w-full">
          <div class="w-full p-1 flex items-center">
            <button
              title="Create Room"
              class="p-1 border-2 text-blue-800 w-full box-border border-blue-600 rounded"
              onclick={(e) => {
                e.stopPropagation();
                showCreateRoomModal = true;
              }}
            >
              CREATE ROOM
            </button>
          </div>
          <div class="bg-gray-50">
            {#each sortedRooms as room (room.uid)}
              {@render roomItemRow(room)}
            {/each}
          </div>
        </div>
      {/if}
    </ul>
  </div>
</div>

<!-- TODO - In private room chat, the creator is not receiving messages -->

<!-- SNIPPETS-------------------------------- -->
{#snippet roomItemRow(room: Room)}
  <li>
    <div
      class="flex relative mt-1 items-center gap-1 w-full group hover:bg-gray-200 active:bg-gray-300 {chatStore
        .activeChatTarget?.uid === room.uid
        ? 'bg-gray-300'
        : ''} py-1 px-2"
    >
      <button
        class="flex items-center gap-2 w-full py-1 px-2"
        onclick={() => {
          console.log("Clicked room:", room);
          chatStore.activeChatTarget = room;
        }}
      >
        <Hash size={12} />
        <span>{room.name}</span>
        <span class="text-xs font-medium">({room.userCount})</span>
      </button>
      {#if room.type === "private"}
        <!-- PRIVATE ROOM--------------  -->
        {#if room.createdBy === me?.uid}
          <div class="flex items-center gap-1 absolute right-2">
            <Lock size={14} strokeWidth={3} />
            {@render roomSettingsBtn(room)}
          </div>
        {:else}
          <div class="flex items-center gap-1 absolute right-2">
            <Lock size={14} strokeWidth={3} />
            {#if chatStore.joinedRooms.has(room.uid)}
              {@render LeaveRoomBtn(room)}
            {:else}
              {@render JoinRoomBtn(room)}
            {/if}
          </div>
        {/if}

        <!-- PUBLIC ROOM------------  -->
      {:else if room.createdBy === me?.uid}
        <div class="flex items-center gap-1 absolute right-2">
          <span class="text-xs text-gray-400">Public</span>
          {@render roomSettingsBtn(room)}
        </div>
      {:else}
        <div class="flex items-center gap-1 absolute right-2">
          <span class="text-xs text-gray-400">Public</span>
          {#if chatStore.joinedRooms.has(room.uid)}
            {@render LeaveRoomBtn(room)}
          {:else}
            {@render JoinRoomBtn(room)}
          {/if}
        </div>
      {/if}
    </div>
  </li>
{/snippet}

{#snippet LeaveRoomBtn(room: Room)}
  <button
    class="flex items-center gap-1 rounded px-1 text-xs hover:scale-105 py-0.5 ease-in-out duration-100 hover:shadow active:scale-95 text-red-600 hover:text-red-700 bg-gray-100 border border-gray-200 hover:bg-white"
    onclick={(e) => {
      e.stopPropagation();
      handlLeaveRoom(room);
    }}
  >
    Leave
  </button>
{/snippet}

{#snippet JoinRoomBtn(room: Room)}
  <button
    class="flex items-center gap-1 rounded px-1 text-xs hover:scale-105 py-0.5 ease-in-out duration-100 hover:shadow active:scale-95 text-blue-600 hover:text-blue-700 bg-gray-100 border border-gray-200 hover:bg-white"
    onclick={(e) => {
      e.stopPropagation();
      handleJoinRoom(room);
    }}
  >
    Join
  </button>
{/snippet}

{#snippet roomSettingsBtn(room: Room)}
  <button
    class="flex items-center gap-1 rounded px-1 text-xs hover:scale-105 py-0.5 ease-in-out duration-100 hover:shadow active:scale-95 border border-gray-200 hover:bg-white"
    onclick={(e) => {
      e.stopPropagation();
      selectedRoomForManagement = room;
    }}
  >
    <Settings2 size={14} />
  </button>
{/snippet}

{#snippet userItemRow(user: User)}
  <li>
    <div class="flex items-center gap-1 w-full relative group">
      <button
        class="px-2 py-1 w-full hover:bg-gray-300 relative flex gap-1 border-gray-200"
        id={user.uid}
        style={chatStore.activeChatTarget?.uid === user.uid
          ? "background-color: #1e1e1e; color: white;"
          : ""}
        onclick={(e) => {
          chatStore.activeChatTarget = user;
        }}
      >
        <div class="flex items-center gap-2 w-full overflow-hidden">
          <GenderIcon gender={user.gender} />
          <span class="truncate">
            {#if user.uid === me.uid}
              You
            {:else}
              {user.username}
            {/if}
          </span>

          {#if user.country && user.country !== "0"}
            <span
              class="font-bold ml-auto text-xs shrink-0 flex items-center gap-1"
            >
              {user.country}
              <span class={`fi fi-${user.country.toLocaleLowerCase()}`}> </span>
            </span>
          {/if}
        </div>

        {@render unreaStatus(user.uid!)}
      </button>
    </div>
  </li>
{/snippet}

{#snippet unreaStatus(uid: string)}
  {#if (chatStore.unread.get(uid!) ?? 0) > 0}
    <span
      class="w-4 h-4 rounded-full bg-red-600 animate-pulse text-[10px] flex items-center justify-center text-white ml-auto"
    >
      {chatStore.unread.get(uid!) ?? 0}
    </span>
  {/if}
{/snippet}
