<script lang="ts">
  import VirtualList from "./VirtualList.svelte";

  let list = $state(Array.from({ length: 100 }, (_, i) => i));
  let push = $state(false);
  function handlePrepend() {
    let startIndex = list.length;
    list = [...Array.from({ length: 20 }, (_, i) => i + startIndex), ...list];
    push = false;
  }
  function handlePush() {
    let startIndex = list.length;
    list = [...list, ...Array.from({ length: 20 }, (_, i) => i + startIndex)];
    push = true;
  }
</script>

<VirtualList itemHeight={60} height={500} />

<button onclick={() => handlePush()}>Push</button>
<button onclick={() => handlePrepend()}>Prepend</button>
