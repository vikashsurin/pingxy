<script lang="ts">
  import { Mars } from "@lucide/svelte";
  import { Venus } from "@lucide/svelte";
  import type { User } from "../../../../shared/src";

  let { user: me, users, activeSocket, setactiveSocket, unread } = $props();

  let filterGender = $state("all");

  const filteredUsers = $derived.by<User[]>(() => {
    if (!users || users.size === 0) {
      return [];
    }
    const allUsers: User[] = Array.from(users.values());

    if (filterGender === "all") {
      return allUsers;
    }

    return allUsers.filter((usr) => usr.gender === filterGender);
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
              <!-- You -->
            {:else}
              <div class="flex items-center gap-1 w-full">
                {@render genderIcon(user.gender)}
                <span>
                  {user.username}
                </span>

                {@render unreaStatus(user.uid!)}
              </div>
            {/if}
          </button>
        </li>
      {/each}
    </ul>
  </div>
</div>

{#snippet genderIcon(gender: string)}
  <span>
    {#if gender === "male"}
      <Mars size={14} class="text-blue-500" strokeWidth={3} />
    {:else if gender === "female"}
      <Venus size={14} class="text-pink-500" strokeWidth={3} />
    {/if}
  </span>
{/snippet}

{#snippet unreaStatus(uid: string)}
  {#if unread.has(uid!)}
    <span class=" w-1.5 h-1.5 rounded-full bg-green-500 flex ml-auto"></span>
  {/if}
{/snippet}
