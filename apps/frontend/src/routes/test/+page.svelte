<script>
  import { toast } from "$lib/components/toast/toast.svelte";
</script>

<button
  on:click={() =>
    toast("Profile updated!", { type: "success", duration: 3000 })}
>
  Save
</button>

<button on:click={() => toast("Failed to connect", { type: "error" })}>
  Trigger error
</button>
