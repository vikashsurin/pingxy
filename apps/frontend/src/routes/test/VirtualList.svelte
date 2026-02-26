<script lang="ts">
    import { tick } from "svelte";

    interface Props {
        items: any[]; // The reactive messageArray from your parent
        index: Map<number, any>; // The Map index for fast lookups
        estimatedHeight?: number;
        buffer?: number; // How many items to render outside the viewport
    }

    let { items, index, estimatedHeight = 80, buffer = 5 }: Props = $props();

    let container: HTMLElement | undefined = $state();
    let viewportHeight = $state(0);
    let scrollTop = $state(0);

    // 1. Calculate Offsets & Total Height
    // Using $derived.by for complex calculation
    let offsets = $derived.by(() => {
        let current = 0;
        return items.map((item) => {
            const top = current;
            current += item.height ?? estimatedHeight;
            return top;
        });
    });

    let totalHeight = $derived(
        offsets.length > 0
            ? offsets[offsets.length - 1] +
                  (items[items.length - 1].height ?? estimatedHeight)
            : 0,
    );

    // 2. Calculate Visible Range
    let visibleRange = $derived.by(() => {
        let start = 0;
        let end = items.length;

        for (let i = 0; i < offsets.length; i++) {
            if (offsets[i] + (items[i].height ?? estimatedHeight) > scrollTop) {
                start = Math.max(0, i - buffer);
                break;
            }
        }

        for (let i = start; i < offsets.length; i++) {
            if (offsets[i] > scrollTop + viewportHeight) {
                end = Math.min(items.length, i + buffer);
                break;
            }
        }

        return { start, end };
    });

    // 3. Measurement Action
    function measure(node: HTMLElement, id: number) {
        const observer = new ResizeObserver(() => {
            const { height } = node.getBoundingClientRect();
            const item = index.get(id);
            if (item && item.height !== height) {
                item.height = height;
            }
        });

        observer.observe(node);
        return { destroy: () => observer.disconnect() };
    }

    // 4. Exposed Method for Prepending (Anchoring)
    export async function prependItems(newItems: any[]) {
        if (!container) return;

        // Find anchor (first item currently in view)
        const anchorIdx = items.findIndex(
            (_, i) => offsets[i] >= container!.scrollTop,
        );
        const anchorItem = items[anchorIdx];
        const anchorOffset = offsets[anchorIdx] - container.scrollTop;

        // The parent handles the actual array update
        // items = [...newItems, ...items];

        await tick(); // Wait for Svelte 5 to update offsets

        const newAnchorIdx = items.findIndex((m) => m.id === anchorItem.id);
        container.scrollTop = offsets[newAnchorIdx] - anchorOffset;
    }
</script>

<div
    bind:this={container}
    bind:offsetHeight={viewportHeight}
    onscroll={(e) => (scrollTop = e.currentTarget.scrollTop)}
    class="relative overflow-y-auto w-full h-full"
>
    <div class="relative w-full" style:height="{totalHeight}px">
        {#each items.slice(visibleRange.start, visibleRange.end) as item (item.id)}
            {@const idx = items.indexOf(item)}
            <div
                use:measure={item.id}
                class="absolute top-0 left-0 w-full"
                style:transform="translateY({offsets[idx]}px)"
            >
                <slot {item} />
            </div>
        {/each}
    </div>
</div>
