<script lang="ts">
  import { enhance } from "$app/forms";
  import Primary from "$lib/components/ui/button/Primary.svelte";
  import Input from "$lib/components/ui/form/Input.svelte";
  import { chatStore } from "$lib/store/store.svelte.js";
  import { debounce } from "$lib/utils/debounce";
  import { Eye, EyeOff, User as UserIcon } from "@lucide/svelte";
  import { type User } from "@pingxy/shared";
  import { onMount } from "svelte";

  onMount(() => {});
  const range = (start: number, end: number) =>
    Array.from({ length: end - start + 1 }, (_, i) => i + start);

  let username = $state("");
  let password = $state("");

  let loading = $state(false); // let geoLocation = $state();

  let errText = $state("");
  let okText = $state("");

  const debounceCheck = debounce(async () => {
    // use Constant from shared/constants.ts for length cheking..
    if (!username) {
      errText = "username is required";
      return;
    } else if (username.length < 3) {
      errText = "Username too short, min 3 characters";
      return;
    } else if (username.length > 20) {
      errText = "Username too long, max 20 characters";
      return;
    } else if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(username)) {
      errText = "Inavalid character in username";

      return;
    }

    const response = await fetch(`/api/users/check?username=${username}`, {
      method: "GET",
    });

    const data = await response.json();

    if (data.available) {
      errText = "";
      okText = "Ok";
    } else {
      errText = "Username Taken";
    }
  }, 500);
</script>

<form
  class="flex flex-col gap-4 text-sm w-full"
  method="POST"
  use:enhance={() => {
    loading = true;
    return async ({ result, update }) => {
      if (result.type === "success" && result.data !== undefined) {
        chatStore.currentUser = result.data.user as User;
      }

      await update();
      loading = false;
    };
  }}
>
  <Input
    label="Username"
    name="username"
    icon={UserIcon}
    placeholder="Enter your username"
    bind:value={username}
    {errText}
    {okText}
    autocomplete="given-name"
    oninput={() => debounceCheck()}
  />
  <Input
    label="Password"
    type="password"
    name="password"
    icon={EyeOff}
    toggleIcon={Eye}
    placeholder="Enter your password"
    autocomplete="current-password"
    bind:value={password}
  />
  <Primary size="md" label="Login" {loading} fn={() => {}} />
</form>
