import { RefObject, useEffect } from "react";

type Handler = (event: MouseEvent | TouchEvent) => void;
// Change the RefObject type to include | null
export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>, // Add | null here
  handler: Handler,
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref?.current;

      // The check "!el" handles the null case safely
      if (!el || el.contains(event.target as Node)) {
        return;
      }

      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}
