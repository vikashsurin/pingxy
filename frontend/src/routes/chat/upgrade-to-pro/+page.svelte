<script lang="ts">
    import { Check } from "@lucide/svelte";
</script>

<div class="max-w-4xl mx-auto p-6 text-center">
    <h1 class="text-3xl font-bold mb-4">Upgrade to Pro</h1>
    <p class="text-gray-600 mb-8">
        Unlock the full potential of your chat experience.
    </p>

    <div class="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        <!-- Free Plan -->
        <div class="border rounded-xl p-6 bg-gray-50 opacity-80">
            <h3 class="text-xl font-semibold mb-2">Free</h3>
            <p class="text-3xl font-bold mb-4">
                $0<span class="text-sm font-normal text-gray-500">/mo</span>
            </p>
            <ul class="text-sm space-y-3 text-left mb-6">
                <li class="flex items-center gap-2">
                    <Check size={16} /> Global Chat access
                </li>
                <li class="flex items-center gap-2">
                    <Check size={16} /> Basic profile
                </li>
            </ul>
            <button
                class="w-full py-2 border border-gray-300 rounded-lg font-medium cursor-default"
                >Current Plan</button
            >
        </div>

        <!-- Pro Plan -->
        <div
            class="border-2 border-blue-500 rounded-xl p-6 bg-white shadow-lg transform hover:-translate-y-1 transition-transform relative overflow-hidden"
        >
            <div
                class="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg"
            >
                POPULAR
            </div>
            <h3 class="text-xl font-semibold mb-2">Pro</h3>
            <p class="text-3xl font-bold mb-4">
                $9<span class="text-sm font-normal text-gray-500">/mo</span>
            </p>
            <ul class="text-sm space-y-3 text-left mb-6">
                <li class="flex items-center gap-2">
                    <Check size={16} class="text-blue-500" /> Unlimited Message History
                </li>
                <li class="flex items-center gap-2">
                    <Check size={16} class="text-blue-500" /> Verfied Badge
                </li>
                <li class="flex items-center gap-2">
                    <Check size={16} class="text-blue-500" /> Priority Support
                </li>
                <li class="flex items-center gap-2">
                    <Check size={16} class="text-blue-500" /> Custom Profile Themes
                </li>
            </ul>
            <button
                class="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
                Upgrade Now
            </button>
        </div>
    </div>
</div>
