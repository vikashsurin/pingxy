<script lang="ts">
  let { user, users, activeSocket, setactiveSocket, unread } = $props();
</script>

<!-- USERS -->
<div class="bg-gray-100 min-w-[300px]">
  <div class="">
    <h2 class="font-bold bg-gray-200 py-2 px-3">Users</h2>
    <ul>
      {#each users as [key, value]}
        <li>
          <button
            class="px-2 py-0.5 w-full hover:bg-gray-300 relative flex gap-1 border-gray-200"
            id={value.uid}
            style={activeSocket?.uid === value.uid
              ? "background-color: gray; color: white;"
              : ""}
            onclick={(e) => setactiveSocket(value)}
          >
            {#if value.uid === user.uid}
              You
            {:else}
              {#if unread.has(value.uid!)}
                <div
                  class=" w-1.5 h-1.5 rounded-full bg-green-500 absolute left-0"
                ></div>
              {/if}
              {value.username}
            {/if}
          </button>
        </li>
      {/each}
    </ul>
  </div>
</div>
