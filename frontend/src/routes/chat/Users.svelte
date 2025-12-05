<script lang="ts">
  import { Mars } from "@lucide/svelte";
  import { Venus } from "@lucide/svelte";
  import type { User } from "../../../../shared/src/validation";

  let { user: me, users, activeSocket, setactiveSocket, unread } = $props();

  let filterGender = $state("all");

  const filteredUsers = $derived.by<User[]>(() => {
    const allUsers = Array.from(users.values());

    switch (filterGender) {
      case "all":
        return allUsers;
      case "female":
        return allUsers.filter((usr: User) => usr.gender === "female");
      case "male":
        return allUsers.filter((usr: User) => usr.gender === "male");
      default:
        return allUsers;
    }
  });

  function handleGenderFilter(e) {
    filterGender = e.target.value;
  }
</script>

<!-- USERS -->
<div class="bg-gray-100 min-w-[300px] flex flex-col overflow-hidden">
  <div class="flex flex-col overflow-hidden flex-1">
    <div class=" bg-gray-200 py-2 px-3 shrink-0">
      <h2 class="font-bold">Users</h2>
      <form action="">
        <label>
          <input
            name="gender"
            onchange={(e) => handleGenderFilter(e)}
            type="radio"
            value="all"
          />
          All
        </label>
        <label>
          <input
            name="gender"
            onchange={(e) => handleGenderFilter(e)}
            type="radio"
            value="female"
          />
          Female
        </label>
        <label>
          <input
            name="gender"
            onchange={(e) => handleGenderFilter(e)}
            type="radio"
            value="male"
          />
          Male
        </label>
      </form>
    </div>
    <ul class="flex-1 overflow-y-auto">
      {#each filteredUsers as user (user.uid)}
        <li>
          <button
            class="px-2 py-0.5 w-full hover:bg-gray-300 relative flex gap-1 border-gray-200"
            id={user.uid}
            style={activeSocket?.uid === user.uid
              ? "background-color: gray; color: white;"
              : ""}
            onclick={(e) => setactiveSocket(user)}
          >
            {#if user.uid === me.uid}
              You
            {:else}
              {#if unread.has(user.uid!)}
                <div
                  class=" w-1.5 h-1.5 rounded-full bg-green-500 absolute left-0"
                ></div>
              {/if}
              <span class="flex items-center gap-1">
                {#if user.gender === "male"}
                  <Mars size={16} class="text-blue-500" />
                {:else if user.gender === "female"}
                  <Venus size={17} class="text-pink-500" />
                {/if}
                {user.username}
              </span>
            {/if}
          </button>
        </li>
      {/each}
    </ul>
  </div>
</div>
