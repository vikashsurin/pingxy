<script lang="ts">
  import { getUser } from "$lib/store/services/api/user";

  async function fetchUser() {
    const user = await getUser(5);
    console.log({ user });
  }
</script>

<button onclick={fetchUser}>fetchUser</button>
