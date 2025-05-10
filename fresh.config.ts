import { defineConfig } from "$fresh/server.ts";
import tailwind from "$fresh/plugins/tailwind.ts";
import { handler as analyticsMiddleware } from "./middleware/analytics.ts";

export default defineConfig({
  plugins: [tailwind()],
  middlewares: [
    {
      path: "/", // Apply to all routes
      middleware: {
        handler: analyticsMiddleware,
      },
    },
  ],
});
