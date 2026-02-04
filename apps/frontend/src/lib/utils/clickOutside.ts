/** clickOutside.ts */
import type { Action } from "svelte/action";

export const clickOutside: Action<HTMLElement, () => void> = (
  node,
  callback,
) => {
  const handleClick = (event: MouseEvent) => {
    // Cast event.target to Node to use .contains()
    if (
      node &&
      !node.contains(event.target as Node) &&
      !event.defaultPrevented
    ) {
      callback?.();
    }
  };

  // Using capture phase (true) ensures the listener runs before other bubbling events
  document.addEventListener("click", handleClick, true);

  return {
    destroy() {
      document.removeEventListener("click", handleClick, true);
    },
  };
};
