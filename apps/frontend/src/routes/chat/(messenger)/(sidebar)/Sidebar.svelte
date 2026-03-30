<script lang="ts">
  import { MessageSquare, MessagesSquare, Users } from "@lucide/svelte";
  import OnlineUsers from "./OnlineUsers.svelte";
  import RecentChats from "./RecentChats.svelte";
  import SidebarFilter from "./SidebarFilter.svelte";
  import GroupChats from "./GroupChats.svelte";
  let searchQuery = $state("");
  let gender = $state("all");

  let activeTab = $state("groups");

  let tabs = [
    {
      id: 1,
      name: "Users",
      icon: Users,
      value: "users",
    },
    {
      id: 2,
      name: "Groups",
      icon: MessagesSquare,
      value: "groups",
    },
    {
      id: 3,
      name: "Chats",
      icon: MessageSquare,
      value: "chats",
    },
  ];
</script>

<div class="col-span-3 border-5 border-purple-500">
  <SidebarFilter bind:gender bind:searchQuery />
  <!-- TODO: complete the sidebar with online users and recent chats, also add the filter -->

  <div class="w-full flex justify-between">
    {#each tabs as tab (tab.id)}
      <button
        onclick={() => (activeTab = tab.value)}
        style:background-color={activeTab === tab.value ? "#fff" : ""}
        style:color={activeTab === tab.value ? "blue" : "#1e1e1e"}
        class="bg-gray-200 p-2 flex flex-1 items-center justify-center hover:bg-amber-500"
      >
        <tab.icon size={16} strokeWidth={2.5} />
      </button>
    {/each}
  </div>

  {#if activeTab === "users"}
    <OnlineUsers {searchQuery} {gender} />
  {:else if activeTab === "groups"}
    <GroupChats />
  {:else}
    <RecentChats />
  {/if}
</div>
