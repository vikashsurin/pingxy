import { tick } from "svelte";

export type Toast = {
  id: number;
  message: string;
  type: "success" | "error" | "info" | "warning";
  duration?: number;
};

export const toasts = $state<Toast[]>([]);

let nextId = 1;

export function toast(
  message: string,
  options: Partial<Pick<Toast, "type" | "duration">> = {},
) {
  const t: Toast = {
    id: nextId++,
    message,
    type: "info",
    duration: 5000,
    ...options,
  };

  toasts.push(t);

  // Auto-remove after duration
  setTimeout(() => {
    remove(t.id);
  }, t.duration);

  tick(); // helps with reactivity in some edge cases
}

export function remove(id: number) {
  const idx = toasts.findIndex((t) => t.id === id);
  if (idx !== -1) toasts.splice(idx, 1);
}
