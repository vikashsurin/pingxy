export function formatLocalTime(isoUtc: Date): string {
  const date = new Date(isoUtc);
  return date
    .toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .toLowerCase(); // → "6:36 pm"
}

// Usage:
// console.log(formatLocalTime("2026-02-27T13:06:47.982Z")); // "6:36 pm"
