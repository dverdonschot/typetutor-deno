import { Handlers } from "fresh/compat";

export const handler: Handlers = {
  async GET() {
    const trigraphsDir = "./static/content/trigraphs";
    try {
      const files = [];
      for await (const dirEntry of Deno.readDir(trigraphsDir)) {
        if (dirEntry.isFile && dirEntry.name.endsWith(".txt")) {
          files.push(dirEntry.name.replace(".txt", ""));
        }
      }
      return new Response(JSON.stringify(files), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error reading trigraphs directory:", error);
      return new Response(
        JSON.stringify({ error: "Failed to read trigraphs directory." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  },
};
