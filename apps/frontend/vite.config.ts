import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { resolve } from "path";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit(),
    tsconfigPaths({
      root: resolve(__dirname, "../../"),
      projects: [resolve(__dirname, "../backend/tsconfig.json")],
    }),

  ],

  server: {
    host: '0.0.0.0', // Necessary for Docker to map ports
    port: 3001,
    strictPort: true,
    hmr: {
      // This tells Vite to connect HMR to the Caddy proxy, not directly to 5173
      clientPort: 80,
      path: '/_svelte_kit_hmr'
    },
    watch: {
      // If you are on Windows/macOS, polling might be needed for volume changes
      usePolling: true,
    }
  }
});
