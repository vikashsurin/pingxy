import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { resolve } from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit(), tsconfigPaths({
    root: resolve(__dirname, '../../'),
    projects: [resolve(__dirname, '../backend/tsconfig.json')],
  })],

});
