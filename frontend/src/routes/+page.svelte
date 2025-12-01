<!-- <script lang="ts">
  import { goto } from "$app/navigation";

  const socket = new WebSocket("ws://localhost:3000");
  function init() {
    console.log("init");
  }

  let username = $state();

  async function handleLogin() {
    const response = await fetch("http://localhost:3000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username }),
    });

    const data = await response.json();
    goto("/chat");
    console.log(data);
  }
</script>

<h1>Websocket</h1>
<div>
  <input type="text" placeholder="username" bind:value={username} />
  <button onclick={handleLogin}>Login as Guest</button>
</div> -->
