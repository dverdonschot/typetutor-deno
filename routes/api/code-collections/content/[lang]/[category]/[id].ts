import { Handlers } from "fresh/compat";

export const handler: Handlers = {
  /** Returns code snippets from a specific collection. */
  async GET(ctx) {
    try {
      const languageCode = ctx.params.lang;
      const categoryName = ctx.params.category;
      const collectionId = ctx.params.id;

      if (!languageCode || !categoryName || !collectionId) {
        return new Response(
          JSON.stringify({ error: "Missing required parameters" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      const filePath =
        `./static/content/code-collections/${languageCode}/${categoryName}/${collectionId}.json`;

      try {
        const fileContent = await Deno.readTextFile(filePath);
        const codeSnippets = JSON.parse(fileContent);

        // Validate that it's an array of code snippets
        if (!Array.isArray(codeSnippets)) {
          return new Response(
            JSON.stringify({ error: "Invalid collection format" }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            },
          );
        }

        // Add index to each snippet for selection
        const snippetsWithIndex = codeSnippets.map((snippet, index) => ({
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
            error:
              `Collection not found: ${languageCode}/${categoryName}/${collectionId}`,
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
    } catch (error) {
      console.error(
        `Error fetching content for ${ctx.params.lang}/${ctx.params.category}/${ctx.params.id}:`,
        error,
      );
      return new Response(
        JSON.stringify({
          error: "Failed to fetch code collection content",
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
