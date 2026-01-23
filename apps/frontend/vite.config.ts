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
    port: 3001,
    host: "0.0.0.0",
    strictPort: true,
    hmr: {
      // This is the "magic" that makes HMR work through the proxy
      path: "/_svelte_kit_hmr",
      clientPort: 80,
    },
    // proxy: {
    //   "/api": {
    //     target: "http://localhost:3000",
    //     changeOrigin: true,
    //   },
    // },
  },
});
