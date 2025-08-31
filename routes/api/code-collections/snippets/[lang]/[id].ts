import { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
  /** Returns code snippets from a specific collection. */
  async GET(_req, ctx) {
    try {
      const languageCode = ctx.params.lang;
      const collectionId = ctx.params.id;

      if (!languageCode || !collectionId) {
        return new Response(
          JSON.stringify({ error: "Missing required parameters" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      const filePath = `./static/content/code-collections/${languageCode}/${collectionId}.json`;

      try {
        const fileContent = await Deno.readTextFile(filePath);
        const collection = JSON.parse(fileContent);

        // Validate that it has snippets
        if (!collection.snippets || !Array.isArray(collection.snippets)) {
          return new Response(
            JSON.stringify({ error: "Invalid collection format" }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            },
          );
        }

        // Add index to each snippet for selection
        const snippetsWithIndex = collection.snippets.map((snippet: any, index: number) => ({
          ...snippet,
          index,
        }));

        return new Response(JSON.stringify(snippetsWithIndex), {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=300", // 5 minutes cache
          },
        });
      } catch (error) {
        console.error(`Error reading collection file ${filePath}:`, error);
        return new Response(
          JSON.stringify({ 
            error: `Collection not found: ${languageCode}/${collectionId}` 
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
    } catch (error) {
      console.error(
        `Error fetching snippets for ${ctx.params.lang}/${ctx.params.id}:`,
        error,
      );
      return new Response(
        JSON.stringify({
          error: "Failed to fetch collection snippets",
          details: error instanceof Error ? error.message : "unknown error",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  },
};