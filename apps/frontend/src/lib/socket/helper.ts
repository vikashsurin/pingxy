export function getWebSocketUrl() {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";

  // Helper for development: if on Vite default port, point to Backend port
  if (window.location.port === "5173") {
    return `${protocol}//${window.location.hostname}:3000/ws/`;
  }

  // Production or Docker/Nginx: use relative path
  return `${protocol}//${window.location.host}/ws/`;
}
