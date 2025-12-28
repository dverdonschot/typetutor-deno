import { Handlers } from "fresh/compat";

export const handler: Handlers = {
  async GET(ctx) {
    const req = ctx.req;
    const url = new URL(req.url);
    const name = ctx.params.name;
    const count = parseInt(url.searchParams.get("count") || "20", 10);

    if (!name) {
      // This case should ideally be handled by a separate route or return an error
      // For now, we'll return an error as this route is for specific trigraphs
      return new Response(
        JSON.stringify({ error: "Trigraph name not provided." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const filePath = `./static/content/trigraphs/${name}.txt`;
    try {
      const content = await Deno.readTextFile(filePath);
      const words = content.split(/\s+/).filter((word) => word.length > 0);

      // Shuffle and select words
      for (let i = words.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [words[i], words[j]] = [words[j], words[i]];
      }

      const selectedWords = words.slice(0, count);

      return new Response(JSON.stringify(selectedWords), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error(`Error reading trigraph file ${filePath}:`, error);
      return new Response(
        JSON.stringify({ error: `Failed to read trigraph file ${name}.` }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  },
};
