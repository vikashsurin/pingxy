<script lang="ts">
    import { enhance } from "$app/forms";
    import Primary from "$lib/components/ui/button/Primary.svelte";
    import Input from "$lib/components/ui/form/Input.svelte";
    import RadioGroup from "$lib/components/ui/form/RadioGroup.svelte";
    import Select from "$lib/components/ui/form/Select.svelte";
    import countries from "$lib/countires.json";
    import { chatStore } from "$lib/stores/store.svelte.js";
    import { debounce } from "$lib/utils/debounce";
    import { CircleAlert, CircleCheck, User as UserIcon } from "@lucide/svelte";
    import { type User } from "@pingxy/shared";
    import { onMount } from "svelte";

    let { form } = $props();

    onMount(() => {});
    const range = (start: number, end: number) =>
        Array.from({ length: end - start + 1 }, (_, i) => i + start);

    const ageOptions = range(18, 70).map((age) => ({
        name: age,
        value: age,
    }));
    const genderOptions = [
        { id: 1, name: "gender", label: "Male", value: "male" },
        { id: 2, name: "gender", label: "Female", value: "female" },
        { id: 3, name: "gender", label: "Other", value: "other" },
    ];
    let username = $state("");
    let age = $state(18);
    let country = $state("AF");
    let hint = $state<{ error: boolean | null; text: string }>({
        error: null,
        text: "",
    });
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
    class="flex flex-col gap-4 text-sm"
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
        autocomplete="username"
        {errText}
        {okText}
        oninput={() => debounceCheck()}
    />
    <RadioGroup label="Gender" options={genderOptions} />

    <Select label="Age" name="age" bind:value={age} options={ageOptions} />
    <Select
        label="Country"
        name="country"
        bind:value={country}
        options={countries}
    />

    <Primary size="md" label="Login as Guest" {loading} fn={() => {}} />
</form>
