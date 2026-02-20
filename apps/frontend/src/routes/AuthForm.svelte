<script lang="ts">
    import { enhance } from "$app/forms";
    import Primary from "$lib/components/ui/button/Primary.svelte";
    import Input from "$lib/components/ui/form/Input.svelte";
    import RadioGroup from "$lib/components/ui/form/RadioGroup.svelte";
    import Select from "$lib/components/ui/form/Select.svelte";
    import countries from "$lib/countires.json";
    import { chatStore } from "$lib/store/store.svelte.js";
    import { debounce } from "$lib/utils/debounce";
    import {
        CircleAlert,
        CircleCheck,
        User as UserIcon,
        EyeOff,
        Eye,
    } from "@lucide/svelte";
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
    let password = $state("");
    let confirmPassword = $state("");
    let gender = $state("all");
    let age = $state(18);
    let country = $state("AF");
    let mode = $state("login"); // login | register | guest
    let hint = $state<{ error: boolean | null; text: string }>({
        error: null,
        text: "",
    });
    let loading = $state(false); // let geoLocation = $state();

    const debounceCheck = debounce(async () => {
        // use Constant from shared/constants.ts for length cheking..
        if (!username) {
            hint.error = null;
            hint.text = "";
            return;
        } else if (username.length < 3) {
            hint.error = true;
            hint.text = "Username too short, min 3 characters";
            return;
        } else if (username.length > 20) {
            hint.error = true;
            hint.text = "Username too long, max 20 characters";
            return;
        } else if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(username)) {
            hint.error = true;
            hint.text = "Username must start with a letter";
            return;
        }

        const response = await fetch(`/api/users/check?username=${username}`, {
            method: "GET",
        });

        const data = await response.json();

        if (mode === "login") {
            // For login, we WANT the user to exist (available: false)
            if (!data.available) {
                hint.error = false;
                // hint.text = "Username found";
            } else {
                hint.error = true;
                hint.text = "Username not found";
            }
        } else {
            // Register / Guest: We want availability
            if (data.available) {
                hint.error = false;
                hint.text = "Ok";
            } else {
                hint.error = true;
                hint.text = "Username Taken";
            }
        }
    }, 500);
</script>

<div class="md:w-96 w-full mx-auto">
    <div class="flex flex-col bg-white rounded-lg md:shadow-lg p-6">
        <h1 class="text-xl font-bold py-2 mb-4 text-center">
            {mode === "login"
                ? "Welcome Back!"
                : mode === "register"
                  ? "Create Account"
                  : "Guest Access"}
        </h1>

        <!-- Tabs -->
        <div class="flex gap-2 bg-gray-100 p-1 rounded-lg mb-6">
            {#each ["login", "register", "guest"] as m}
                <button
                    class="flex-1 py-1 text-sm font-medium rounded-md capitalize transition-all duration-200
            {mode === m
                        ? 'bg-white text-sky-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'}"
                    onclick={() => {
                        mode = m;
                        hint.error = null;
                        hint.text = "";
                        form = null;
                    }}
                >
                    {m}
                </button>
            {/each}
        </div>

        <!-- Feedback Area -->
        {#if form?.invalid}
            <div
                class="flex items-center gap-2 p-3 mb-4 text-sm text-red-700 bg-red-50 rounded-lg border border-red-100"
            >
                <CircleAlert size={16} />
                <p>{form.invalid}</p>
            </div>
        {/if}

        <!-- Validation Hint -->
        {#if hint.text}
            <div
                class="flex items-center gap-2 text-xs mb-2 px-1 {hint.error
                    ? 'text-red-500'
                    : 'text-green-500'}"
            >
                {#if hint.error}
                    <CircleAlert size={12} />
                {:else}
                    <CircleCheck size={12} />
                {/if}
                <p>{hint.text}</p>
            </div>
        {/if}
        <form
            class="flex flex-col gap-4 text-sm"
            method="POST"
            action="?/{mode}"
            use:enhance={() => {
                loading = true;
                return async ({ result, update }) => {
                    if (
                        result.type === "success" &&
                        result.data !== undefined
                    ) {
                        chatStore.currentUser = result.data.user as User;
                    }

                    await update();
                    loading = false;
                };
            }}
        >
            {#if mode === "login"}
                <Input
                    label="Username"
                    name="username"
                    icon={UserIcon}
                    placeholder="Enter your username"
                    bind:value={username}
                />
                <Input
                    label="Password"
                    type="password"
                    name="password"
                    icon={EyeOff}
                    toggleIcon={Eye}
                    placeholder="Enter your password"
                    bind:value={password}
                />
            {:else if mode === "register"}
                <Input
                    label="Username"
                    name="username"
                    icon={UserIcon}
                    placeholder="Enter your username"
                    bind:value={username}
                />
                <Input
                    label="Password"
                    type="password"
                    name="password"
                    icon={EyeOff}
                    toggleIcon={Eye}
                    placeholder="Enter your password"
                    bind:value={password}
                />
                <Input
                    label="Confirm Password"
                    type="password"
                    name="confirmPassword"
                    icon={EyeOff}
                    toggleIcon={Eye}
                    placeholder="Confirm your password"
                    bind:value={confirmPassword}
                />
                <RadioGroup label="Gender" options={genderOptions} />

                <Select
                    label="Age"
                    name="age"
                    bind:value={age}
                    options={ageOptions}
                />
                <Select
                    label="Country"
                    name="country"
                    bind:value={country}
                    options={countries}
                />
            {:else if mode === "guest"}
                <Input
                    label="Username"
                    name="username"
                    icon={UserIcon}
                    placeholder="Enter your username"
                    bind:value={username}
                />

                <RadioGroup label="Gender" options={genderOptions} />

                <Select
                    label="Age"
                    name="age"
                    bind:value={age}
                    options={ageOptions}
                />
                <Select
                    label="Country"
                    name="country"
                    bind:value={country}
                    options={countries}
                />
            {/if}

            <Primary
                size="md"
                label="Submit"
                {loading}
                fn={() => console.log("Submitted")}
            />
        </form>
    </div>
</div>
