<script>
    import { page } from "$app/state";
    import favicon from "$lib/assets/favicon.svg";
    import logo from "$lib/assets/logo.svg";
    import Footer from "../Footer.svelte";

    let { children } = $props();
    let currentPath = $derived(page.url.pathname);
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
    <title>Pingxy</title>
</svelte:head>

<div class="flex flex-col justify-center items-center p-6">
    <div class="flex flex-col items-center">
        <img src={logo} alt="logo" class="w-96" />
        <p class="text-sm text-gray-500 px-3 py-2">
            Connect globally, chat instantly.
        </p>
    </div>

    <div
        class="flex flex-col items-center self-center justify-self-center justify-center p-4 border border-gray-300 w-max rounded-xl my-4"
    >
        {@render tabs()}
        {@render children()}
    </div>
    <Footer />
</div>

{#snippet tabs()}
    <p class="text-center font-bold text-lg py-3">
        {currentPath === "/auth/login"
            ? "Welcome back!"
            : currentPath === "/auth/register"
              ? "Create an account"
              : "Guest Access"}
    </p>
    <div class="flex gap-2 bg-gray-100 p-1 rounded-lg my-4">
        {#each ["login", "register", "guest"] as action}
            <a
                href={`/auth/${action}`}
                class="flex-1 py-1 text-sm px-6 font-medium rounded-md capitalize transition-all duration-200 hover:text-sky-600 {currentPath ===
                `/auth/${action}`
                    ? 'bg-white text-sky-600'
                    : ''}"
            >
                {action}
            </a>
        {/each}
    </div>
{/snippet}
