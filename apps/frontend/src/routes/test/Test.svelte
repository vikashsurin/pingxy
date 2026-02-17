<script lang="ts">
  import { User } from "@lucide/svelte";

  function handleClick(e: MouseEvent) {
    console.log("Clicked");
  }
</script>

<h1>Test Page</h1>

<form action="">
  <input type="password" placeholder="Password" />
  <User size={14} onclick={(e) => handleClick(e)} class="text-sky-400" />
</form>
