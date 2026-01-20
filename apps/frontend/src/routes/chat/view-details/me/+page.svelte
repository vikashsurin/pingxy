<script lang="ts">
    import { enhance } from "$app/forms";
    import type { SubmitFunction } from "./$types";
    import countries from "$lib/countires.json";
    import { chatStore } from "$lib/store/store.svelte.js";
    import { Check, Loader } from "@lucide/svelte";

    let { form } = $props();

    let loading = $state(false);
    let showSuccess = $state(false);

    // Form handling
    const handleSubmit: SubmitFunction = () => {
        loading = true;
        showSuccess = false;
        return async ({ result, update }) => {
            loading = false;
            if (result.type === "success" && result.data) {
                chatStore.currentUser = result.data.user;
                showSuccess = true;
                setTimeout(() => (showSuccess = false), 3000);
                await update({ reset: false });
            }
        };
    };
</script>

{#if chatStore.currentUser}
    <div class="max-w-2xl mx-auto p-6">
        <h1 class="text-2xl font-bold mb-6">My Profile</h1>

        <form
            class="flex flex-col gap-6"
            method="POST"
            action="?/update"
            use:enhance={handleSubmit}
        >
            <!-- Read-Only Section -->
            <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1">
                    <span
                        class="text-xs font-medium text-gray-500 ml-1 uppercase tracking-wide"
                        >Username</span
                    >
                    <div
                        class="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-gray-600 select-none cursor-not-allowed"
                    >
                        {chatStore.currentUser?.username || "Not set"}
                    </div>
                </div>

                <div class="space-y-1">
                    <span
                        class="text-xs font-medium text-gray-500 ml-1 uppercase tracking-wide"
                        >Age</span
                    >
                    <div
                        class="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-gray-600 select-none cursor-not-allowed"
                    >
                        {chatStore.currentUser?.data.age || "N/A"}
                    </div>
                </div>
            </div>

            <!-- Editable Section -->
            <div class="space-y-4">
                <div class="space-y-1">
                    <span class="text-xs font-medium text-gray-700 ml-1"
                        >Gender</span
                    >
                    <div class="flex gap-2">
                        <label
                            class="flex-1 cursor-pointer border rounded-lg p-3 flex items-center justify-center gap-2 hover:bg-gray-50 has-checked:border-blue-500 has-checked:bg-blue-50 transition-all"
                        >
                            <input
                                type="radio"
                                name="gender"
                                value="female"
                                class="accent-blue-500"
                                checked={chatStore.currentUser?.data.gender ===
                                    "female"}
                            />
                            <span class="text-sm">Female</span>
                        </label>
                        <label
                            class="flex-1 cursor-pointer border rounded-lg p-3 flex items-center justify-center gap-2 hover:bg-gray-50 has-checked:border-blue-500 has-checked:bg-blue-50 transition-all"
                        >
                            <input
                                type="radio"
                                name="gender"
                                value="male"
                                class="accent-blue-500"
                                checked={chatStore.currentUser?.data.gender ===
                                    "male"}
                            />
                            <span class="text-sm">Male</span>
                        </label>
                    </div>
                </div>

                <div class="space-y-1">
                    <span class="text-xs font-medium text-gray-700 ml-1"
                        >Country</span
                    >
                    <select
                        name="country"
                        value={chatStore.currentUser?.data.country}
                        class="w-full border p-2.5 rounded-lg bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 border-gray-200 transition-all"
                    >
                        {#each countries as c}
                            <option value={c.code}>{c.name}</option>
                        {/each}
                    </select>
                </div>

                <div class="space-y-1">
                    <span class="text-xs font-medium text-gray-700 ml-1"
                        >Bio</span
                    >
                    <textarea
                        name="bio"
                        rows="4"
                        value={chatStore.currentUser?.data.bio || ""}
                        class="w-full border p-2.5 rounded-lg resize-none outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 border-gray-200 transition-all"
                        placeholder="Tell us a bit about yourself..."
                    ></textarea>
                </div>
            </div>

            <div class="flex items-center gap-4 mt-2">
                <button
                    disabled={loading}
                    class="bg-blue-600 text-white py-2.5 px-6 rounded-lg font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 min-w-30 justify-center"
                >
                    {#if loading}
                        <Loader class="animate-spin h-4 w-4" />
                        <span>Saving...</span>
                    {:else}
                        Save Changes
                    {/if}
                </button>

                {#if showSuccess}
                    <div
                        class="flex items-center gap-2 text-green-600 text-sm font-medium animate-in fade-in slide-in-from-left-2 duration-300"
                    >
                        <Check size={18} />
                        <span>Saved successfully!</span>
                    </div>
                {/if}
            </div>
        </form>
    </div>
{:else}
    <div class="flex items-center justify-center h-screen">
        <Loader class="animate-spin h-12 w-12" />
    </div>
{/if}
