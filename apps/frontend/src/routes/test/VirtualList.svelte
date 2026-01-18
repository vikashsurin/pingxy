<script lang="ts">
  let { height, itemHeight } = $props();

  let list = $state(Array.from({ length: 100 }, (_, i) => i));

  let scrollElement: HTMLDivElement | undefined = $state();
  let scrollTop = $state(0);

  let startIndex = $derived(Math.floor(scrollTop / itemHeight));
  let endIndex = $derived(startIndex + Math.ceil(height / itemHeight));
  let visibleList = $derived(list.slice(startIndex, endIndex + 1));

  function handleScroll() {
    if (scrollElement) {
      scrollTop = scrollElement.scrollTop;
    }
  }

  // --- Intersection Observer  ---
  function intersectionObserver(node: HTMLElement, callback: () => void) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          callback();
        }
      },
      {
        root: null,
        rootMargin: "400px 0px",
        threshold: 0.1,
      }
    );

    observer.observe(node);

    return {
      destroy() {
        observer.disconnect();
      },
    };
  }

  function handleLoadOlder() {
    console.log("loading older");
    let startIndex = list.length;
    list = [...Array.from({ length: 20 }, (_, i) => i + startIndex), ...list];

    scrollElement?.scrollBy({
      top: itemHeight * 20,
      left: 0,
      behavior: "instant",
    });
  }

  $inspect({ list });
  $inspect({ scrollTop });
</script>

<div
  bind:this={scrollElement}
  data-container
  style:height="{height}px"
  style:width="50%"
  class="bg-gray-300 overflow-auto border-5"
  onscroll={handleScroll}
>
  <div style:height="{list.length * itemHeight}px" class="relative">
    <div
      use:intersectionObserver={handleLoadOlder}
      data-infinite-scroll-trigger="older"
      class="h-1 w-full bg-amber-500"
      aria-hidden="true"
    ></div>
    {#each visibleList as item, index (item)}
      <div
        style="height: {itemHeight}px; width: 100%;"
        class="bg-amber-500 border-t border-2 absolute"
        style:transform="translateY({(startIndex + index) * itemHeight}px)"
      >
        item{item}
      </div>
    {/each}
  </div>
</div>
