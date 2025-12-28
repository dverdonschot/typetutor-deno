import { defineConfig } from "npm:vite@^6";
import { fresh } from "jsr:@fresh/plugin-vite@^1.0";
import tailwindcss from "npm:@tailwindcss/vite@^4";

export default defineConfig({
  plugins: [
    fresh(),
    tailwindcss(),
  ],
});
