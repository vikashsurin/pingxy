import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  // server: {
  //   host: "0.0.0.0", // ✅ All IPv4 interfaces (recommended)
  //   port: 5173,
  //   hmr: {
  //     host: "localhost",
  //   },
  // },
});
