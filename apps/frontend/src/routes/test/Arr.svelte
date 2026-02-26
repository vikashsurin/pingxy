<script lang="ts">
    // 1. The reactive source of truth (Array for the UI/Virtual List)
    let messageArray = $state<{ id: number; text: string; status: string }[]>(
        [],
    );

    // 2. The lookup index (Map for fast updates)
    // We don't need the Map itself to be reactive, just the objects inside it.
    const messageIndex = new Map<number, any>();

    // Helper to add messages and keep them in sync
    function addMessage(id: number, text: string) {
        const newMessage = { id, text, status: "Sent" };

        // Push to reactive array
        messageArray.push(newMessage);

        // Store the reference in the Map
        // In Svelte 5, messageArray[last] is a reactive Proxy
        const proxyRef = messageArray[messageArray.length - 1];
        messageIndex.set(id, proxyRef);
    }

    // 3. The Logic Test: Update by ID
    function updateStatus(id: number, newStatus: string) {
        const msg = messageIndex.get(id);
        if (msg) {
            // This updates the object in the Map AND the Array simultaneously
            // because they point to the same memory reference.
            msg.status = newStatus;
        } else {
            console.error("Message ID not found in index");
        }
    }

    // Create dummy data on load
    for (let i = 1; i <= 5; i++) {
        addMessage(i, `Message number ${i}`);
    }

    // Virtual List Simulation: Slicing the array
    let viewStart = $state(0);
    let visibleMessages = $derived(
        messageArray.slice(viewStart, viewStart + 3),
    );
</script>

<div class="p-4 space-y-4">
    <h2 class="text-xl font-bold">Hybrid Data Logic Demo</h2>

    <section class="border p-4 rounded bg-gray-50">
        <h3 class="font-semibold">1. Update Logic (Using Index)</h3>
        <div class="flex gap-2 mt-2">
            <button
                onclick={() => updateStatus(3, "Read ✅")}
                class="px-4 py-2 bg-blue-500 text-white rounded"
            >
                Mark ID #3 as Read
            </button>
            <button
                onclick={() => updateStatus(1, "Deleted 🗑️")}
                class="px-4 py-2 bg-red-500 text-white rounded"
            >
                Mark ID #1 as Deleted
            </button>
        </div>
    </section>

    <section class="border p-4 rounded bg-amber-50">
        <h3 class="font-semibold">
            2. Virtual View (Sliced Array: {viewStart} to {viewStart + 3})
        </h3>
        <ul class="mt-2 space-y-1">
            {#each visibleMessages as msg}
                <li
                    class="p-2 bg-white border rounded shadow-sm flex justify-between"
                >
                    <span><strong>ID {msg.id}:</strong> {msg.text}</span>
                    <span class="text-sm font-mono bg-gray-100 px-2"
                        >{msg.status}</span
                    >
                </li>
            {/each}
        </ul>
        <button
            onclick={() => (viewStart = viewStart === 0 ? 2 : 0)}
            class="mt-2 text-sm underline"
        >
            Toggle "Scroll" (Slice offset)
        </button>
    </section>

    <section class="text-xs text-gray-500">
        <p>Total items in Array: {messageArray.length}</p>
        <p>Total items in Index: {messageIndex.size}</p>
    </section>
</div>
