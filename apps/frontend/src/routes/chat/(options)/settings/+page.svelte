<script lang="ts">
    import { enhance } from "$app/forms";
    let notifications = $state(true);
    let privacy = $state("everyone");
</script>

<div class="max-w-2xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6">Settings</h1>

    <div class="space-y-6">
        <!-- Account Settings -->
        <div
            class="bg-white border text-sm border-gray-200 rounded-lg p-4 space-y-4"
        >
            <h2 class="text-lg font-semibold border-b pb-2">Account</h2>

            <div class="flex justify-between items-center">
                <div>
                    <p class="font-medium">Pause Account</p>
                    <p class="text-gray-500 text-xs">
                        Temporarily disable your account
                    </p>
                </div>
                <form method="POST" action="?/pause" use:enhance>
                    <button
                        class="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                        Pause
                    </button>
                </form>
            </div>

            <div class="flex justify-between items-center">
                <div>
                    <p class="text-red-600 font-medium">Delete Account</p>
                    <p class="text-gray-500 text-xs">
                        Permanently remove your account and data
                    </p>
                </div>
                <form method="POST" action="?/delete" use:enhance>
                    <button
                        class="px-3 py-1.5 border border-red-200 text-red-600 rounded hover:bg-red-50 transition-colors"
                    >
                        Delete
                    </button>
                </form>
            </div>
        </div>

        <!-- Privacy Settings -->
        <div
            class="bg-white border text-sm border-gray-200 rounded-lg p-4 space-y-4"
        >
            <h2 class="text-lg font-semibold border-b pb-2">Privacy</h2>

            <div class="flex flex-col gap-2">
                <span class="font-medium">Blocked Users</span>
                <a
                    href="/chat/settings/blocked"
                    class="text-blue-600 hover:underline"
                    >Manage blocked users</a
                >
            </div>
        </div>
    </div>
</div>
