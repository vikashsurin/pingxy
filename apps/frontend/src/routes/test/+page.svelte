<script lang="ts">
    // Action
    function observeTop(node: HTMLElement) {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    unshiftArray();
                    console.log("Loading older messages");
                }
            },
            { root: viewportEl, rootMargin: "400px 0px 0px 0px" },
        );

        observer.observe(node);

        return {
            destroy() {
                observer.disconnect();
            },
        };
    }

    function observeBottom(node: HTMLElement) {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    appendDummyArray();

                    console.log("Loading newer messages");
                }
            },
            { root: viewportEl, rootMargin: "0px 0px 400px 0px" },
        );

        observer.observe(node);

        return {
            destroy() {
                observer.disconnect();
            },
        };
    }
    const initialDummyArray = () => {
        const array = [];
        for (let i = 0; i < 20; i++) {
            const id = crypto.randomUUID();
            array.push({ ct: i, id });
        }
        return array;
    };

    const popArray = () => {
        for (let i = 0; i < 5; i++) {
            dummyArray.pop();
        }
    };

    const slice = () => {
        dummyArray = dummyArray.slice(
            dummyArray.length - 20,
            dummyArray.length,
        );
        console.log({ dummyArray });
    };

    const unshiftArray = () => {
        const length = dummyArray.length;
        const tempArray = [];
        for (let i = 0; i < 5; i++) {
            tempArray.push({
                ct: length + i,
                id: crypto.randomUUID(),
            });
        }
        dummyArray = [...tempArray, ...dummyArray];
    };

    const appendDummyArray = () => {
        const length = dummyArray.length;
        const tempArray = [];
        for (let i = length; i < length + 20; i++) {
            const id = crypto.randomUUID();
            tempArray.push({ ct: i, id });
        }
        dummyArray = [...dummyArray, ...tempArray];
    };

    $effect(() => {
        if (dummyArray.length > 100) {
            slice();
        }
    });
    const resetArray = () => {
        dummyArray = initialDummyArray();
    };
    let dummyArray = $state(initialDummyArray());

    let viewportEl: HTMLDivElement | undefined = $state();
    let contentEl: HTMLDivElement | undefined = $state();
</script>

<div
    class="flex flex-col h-full w-full overflow-hidden items-center justify-center p-8"
>
    <span class="font-bold text-2xl">{dummyArray.length}</span>
    <div
        data-name="fixed-viewport"
        bind:this={viewportEl}
        class="relative h-full w-full overflow-y-auto border-5 border-green-500"
        style="overflow-anchor: none; height: 400px; width: 400px;"
    >
        <div class="bg-amger-500 w-full fixed bottom-0 right-0 h-10">
            {viewportEl?.clientHeight}
        </div>
        <div data-name="content" bind:this={contentEl}>
            <div
                use:observeTop
                data-name="buffer-top"
                class="h-1 w-full bg-amber-500"
                aria-hidden="true"
            ></div>

            <ul data-name="messages" class="relative flex flex-col gap-2">
                {#each dummyArray as entry (entry.id)}
                    <div>{entry.ct}</div>
                {/each}
            </ul>
            <div
                use:observeBottom
                data-name="buffer-bottom"
                class="h-1 w-full bg-amber-500"
                aria-hidden="true"
            ></div>
        </div>
    </div>
</div>
<div class="flex justify-center gap-5 items-center">
    <button class="p-2 border border-gray-500" onclick={unshiftArray}
        >Unshift</button
    >
    <button class="p-2 border border-gray-500" onclick={appendDummyArray}
        >Append</button
    >
    <button class="p-2 border border-gray-500" onclick={popArray}>Pop</button>
    <button class="p-2 border border-gray-500" onclick={slice}>Shift</button>
    <button class="p-2 border border-gray-500" onclick={resetArray}
        >reset</button
    >
</div>
