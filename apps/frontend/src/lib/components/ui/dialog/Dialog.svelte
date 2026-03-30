<script lang="ts">
  import { clickOutside } from "$lib/utils/clickOutside";

  let { isOpen = $bindable(), children, blur = 0.5, rounded = 0 } = $props();
</script>

<div
  id="backdrop"
  style:background-color="rgba(0, 0, 0, {blur})"
  class="fixed inset-0 z-900 flex items-center justify-center"
>
  <div
    id="dialog"
    use:clickOutside={() => {
      isOpen = false;
    }}
    style:border-radius="{rounded}px"
    class="bg-white overflow-hidden min-w-xs shadow-2xl"
  >
    {@render children()}
  </div>
</div>
