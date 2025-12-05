<script lang="ts">
  let { username } = $props();
</script>

<div class="flex justify-between items-center">
  <h1 class="p-2">
    Logged in as
    <span class="text-green-600 font-bold">
      {username}
    </span>
  </h1>

  <a
    href="/chat/logout"
    data-sveltekit-preload-data={false}
    class="bg-red-400 p-2">Logout</a
  >
</div>
