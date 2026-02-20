<script lang="ts">
    import logo from "$lib/assets/logo.svg";
    import { Info } from "@lucide/svelte";
    import Footer from "./Footer.svelte";
</script>

<div id="main" class="grid h-screen justify-center items-center">
    <div>
        <!-- <BannerNotification /> -->
    </div>
    <div class="flex flex-col md:items-center">
        <img src={logo} alt="logo" class="w-96" />
        <p class="text-sm text-gray-500 px-3 py-2">
            Connect globally, chat instantly.
        </p>
    </div>
    <!-- <AuthForm {form} /> -->
    <div class="flex flex-col items-center justify-center">
        <span
            class="flex items-center text-amber-800 justify-center bg-amber-400 shadow-2xl shadow-amber-200 text-sm rounded-md border border-amber-500 gap-2 w-max px-3 py-2"
        >
            <Info size={14} />
            <span>
                Site under development, some features may be incomplete. Come
                back soon!
            </span>
        </span>
        <span class="text-sm text-gray-400 px-3 py-2">
            Last updated on : 2026-01-29
        </span>
    </div>
    <Footer />
</div>
