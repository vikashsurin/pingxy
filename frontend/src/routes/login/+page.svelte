<script lang="ts">
  let { data, form } = $props();
</script>

<div class="p-2">
  <h1 class="flex items-center">Websocket</h1>
  <div class=" flex flex-col gap-2 w-1/3">
    <form method="POST" action="?/login">
      {#if form?.invalid}
        <p>invalid username</p>
      {/if}
      <input
        type="text"
        name="username"
        class="border p-2"
        placeholder="username"
        value={form?.username ?? ""}
      />
      <button class="bg-blue-300 p-2">Login as Guest</button>
    </form>
  </div>
</div>
