<script lang="ts">
    import { onMount, tick } from "svelte";

    type Todo = {
        userId: number;
        id: number;
        title: string;
        completed: boolean;
    };

    // State
    let items = $state(initializeItems());
    let viewportEl: HTMLDivElement | undefined = $state();
    let topObserverEl: HTMLDivElement | undefined = $state();
    let bottomObserverEl: HTMLDivElement | undefined = $state();

    // Refs for tracking
    let isLoading = $state(false);
    let firstItemCt = $state(0);
    let lastItemCt = $state(19);
    let scrollVelocity = $state(0);
    let lastScrollTop = 0;
    let lastScrollTime = 0;
    let todos: Todo[] = $state([]);
    onMount(async () => {
        todos = await initializeItems();
    });

    // Initial load
    async function initializeItems() {
        const response = await fetch(
            "https://jsonplaceholder.typicode.com/todos",
        );
        return response.json();
    }

    async function loadOlder() {
        if (isLoading || !viewportEl) return;
        isLoading = true;

        const previousScrollHeight = viewportEl.scrollHeight;
        const previousScrollTop = viewportEl.scrollTop;
        const isNearTop = previousScrollTop < 100; // Check if very close to top
        const response = await fetch(
            "https://jsonplaceholder.typicode.com/todos",
        );
        const data = await response.json();

        const newTodos = await data;

        todos = [...newTodos, ...todos];

        if (todos.length > 300) {
            todos = todos.slice(0, 300);
        }

        console.log(response);

        // Wait for DOM update
        await tick();

        // Restore scroll position
        const newScrollHeight = viewportEl.scrollHeight;
        const heightDifference = newScrollHeight - previousScrollHeight;

        if (isNearTop && scrollVelocity < -50) {
            // User is scrolling fast upward and near the top
            // Add extra buffer to allow continued scrolling
            viewportEl.scrollTop = previousScrollTop + heightDifference + 100;
        } else {
            viewportEl.scrollTop = previousScrollTop + heightDifference;
        }

        // If still at the very top after loading, load more immediately
        await tick();
        if (viewportEl.scrollTop < 50) {
            console.log("Still too close to top, loading more...");
            setTimeout(() => {
                isLoading = false;
                loadOlder();
            }, 50);
        } else {
            setTimeout(() => {
                isLoading = false;
            }, 100);
        }
    }

    async function loadNewer() {
        if (isLoading) return;
        isLoading = true;

        await tick();

        // Check if we need to load more at the bottom
        if (viewportEl) {
            const { scrollTop, scrollHeight, clientHeight } = viewportEl;
            const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

            if (distanceFromBottom < 50) {
                console.log("Still too close to bottom, loading more...");
                setTimeout(() => {
                    isLoading = false;
                    loadNewer();
                }, 50);
                return;
            }
        }

        setTimeout(() => {
            isLoading = false;
        }, 100);
    }

    // Track scroll velocity
    function handleScroll(event: Event) {
        if (!viewportEl) return;

        const currentScrollTop = viewportEl.scrollTop;
        const currentTime = Date.now();
        const timeDiff = currentTime - lastScrollTime;

        if (timeDiff > 0) {
            const scrollDiff = currentScrollTop - lastScrollTop;
            scrollVelocity = (scrollDiff / timeDiff) * 1000; // pixels per second
        }

        lastScrollTop = currentScrollTop;
        lastScrollTime = currentTime;
    }

    // Setup observers using $effect
    $effect(() => {
        if (!viewportEl || !topObserverEl || !bottomObserverEl) return;

        const topObserver = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !isLoading) {
                    console.log("Loading older messages", { scrollVelocity });
                    loadOlder();
                }
            },
            {
                root: viewportEl,
                rootMargin: "100px 0px 0px 0px", // Increased for faster scrolling
                threshold: 0,
            },
        );

        const bottomObserver = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !isLoading) {
                    console.log("Loading newer messages");
                    loadNewer();
                }
            },
            {
                root: viewportEl,
                rootMargin: "0px 0px 100px 0px", // Increased for faster scrolling
                threshold: 0,
            },
        );

        topObserver.observe(topObserverEl);
        bottomObserver.observe(bottomObserverEl);

        return () => {
            topObserver.disconnect();
            bottomObserver.disconnect();
        };
    });

    // Auto-trim when list gets too large
    $effect(() => {});

    function reset() {
        items = initializeItems();
        firstItemCt = 0;
        lastItemCt = 19;
        isLoading = false;
        scrollVelocity = 0;
        lastScrollTop = 0;
        lastScrollTime = 0;
        if (viewportEl) {
            viewportEl.scrollTop = 0;
        }
    }
</script>

<div
    class="flex flex-col h-screen w-full items-center justify-center p-8 gap-4"
>
    <div class="text-center">
        <div class="font-bold text-2xl mb-2">Items: {todos.length}</div>
        <div class="text-sm text-gray-600">
            Range: {firstItemCt} to {lastItemCt}
            {#if isLoading}
                <span class="text-orange-500 ml-2">Loading...</span>
            {/if}
        </div>
        <div class="text-xs text-gray-500 mt-1">
            Scroll velocity: {scrollVelocity.toFixed(0)} px/s
        </div>
    </div>

    <div
        bind:this={viewportEl}
        onscroll={handleScroll}
        class="relative overflow-y-auto border-4 border-blue-500 rounded-lg"
        style="height: 400px; width: 400px;"
    >
        <div
            bind:this={topObserverEl}
            class="h-1 w-full bg-amber-400"
            aria-hidden="true"
        ></div>

        <div>
            <ul class="flex flex-col gap-2 p-2">
                {#each todos as todo (todo.id )}
                    <li
                        class="p-4 bg-blue-100 rounded border border-blue-300 font-mono"
                    >
                        {todo.title}
                    </li>
                {/each}
            </ul>
        </div>

        <div
            bind:this={bottomObserverEl}
            class="h-1 w-full bg-amber-400"
            aria-hidden="true"
        ></div>
    </div>

    <div class="flex gap-4">
        <button
            onclick={loadOlder}
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
            Load Older
        </button>
        <button
            onclick={loadNewer}
            class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
            Load Newer
        </button>
        <button
            onclick={reset}
            class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
            Reset
        </button>
    </div>
</div>
