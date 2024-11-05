import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from 'path';

export default defineConfig(({ mode }) => ({
  build: {
    // sourcemaps have to be inline due to https://github.com/electron/electron/issues/22996
    sourcemap: "inline",
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve("src/client"), // Point `@` to the `src` directory
    },
  },
  server: {
    port: 5123,
    strictPort: true,
  },
  base: mode === "production" ? "./" : "/",
}));
