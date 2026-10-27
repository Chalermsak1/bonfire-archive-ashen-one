import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

const fromRoot = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: "@designcodeio/threeui/style.css", replacement: fromRoot("./src/shaders/threeui.css") },
      { find: "@designcodeio/threeui", replacement: fromRoot("./src/threeui.ts") },
    ],
  },
});
