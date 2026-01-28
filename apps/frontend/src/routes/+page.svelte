<script lang="ts">
    import Test from "./Test.svelte";
    import AuthFrom from "./AuthForm.svelte";
    import AuthForm from "./AuthForm.svelte";
    import BannerNotification from "$lib/components/BannerNotification.svelte";
    import Footer from "./Footer.svelte";

    let { form } = $props();
</script>

<div id="main" class="grid h-screen">
    <Test />
    <!-- <BannerNotification /> -->
    <AuthForm {form} />
    <Footer />
</div>
