import { Handlers } from "fresh/compat";

interface CodeSnippet {
  code: string;
  title: string;
  description: string;
  tags: string[];
  difficulty: string;
  language: string;
  index: number;
}

interface Collection {
  id: string;
  name: string;
  description: string;
  icon: string;
  difficulty: string;
  language: string;
  snippets: CodeSnippet[];
}

interface CollectionMetadata {
  id: string;
  name: string;
  description: string;
  icon: string;
  difficulty: string;
  language: string;
  snippetCount: number;
  tags: string[];
}

interface RandomSnippetResponse {
  snippet: CodeSnippet;
  collectionId: string;
  collectionName: string;
  totalSnippets: number;
}

export const handler: Handlers = {
  /** Returns a random snippet from ANY collection within the specified language. */
  async GET(ctx) {
    try {
      const languageCode = ctx.params.lang;

      if (!languageCode) {
        return new Response(
          JSON.stringify({ error: "Language code not provided" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      const languageDir = `./static/content/code-collections/${languageCode}`;
      const allSnippets: Array<{
        snippet: CodeSnippet;
        collectionId: string;
        collectionName: string;
      }> = [];

      try {
        // Read all JSON files in the language directory
        for await (const dirEntry of Deno.readDir(languageDir)) {
          if (dirEntry.isFile && dirEntry.name.endsWith(".json")) {
            const filePath = `${languageDir}/${dirEntry.name}`;

            try {
              const fileContent = await Deno.readTextFile(filePath);
              const collection: Collection = JSON.parse(fileContent);

              if (collection.snippets && Array.isArray(collection.snippets)) {
                // Add all snippets from this collection to our pool
                collection.snippets.forEach((snippet, index) => {
                  allSnippets.push({
                    snippet: {
                      ...snippet,
                      index, // Preserve original index within collection
                    },
                    collectionId: collection.id,
                    collectionName: collection.name,
                  });
                });
              }
            } catch (error) {
              console.warn(
                `Failed to read collection ${dirEntry.name} for random selection:`,
                error,
              );
              // Continue with other collections
            }
          }
        }
      } catch (error) {
        console.error(
          `Error reading collections for language ${languageCode}:`,
          error,
        );
        return new Response(
          JSON.stringify({
            error: `No collections found for language: ${languageCode}`,
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      if (allSnippets.length === 0) {
        return new Response(
          JSON.stringify({
            error: `No snippets found for language: ${languageCode}`,
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      // Select a random snippet from all available snippets
      const randomIndex = Math.floor(Math.random() * allSnippets.length);
      const selectedSnippet = allSnippets[randomIndex];

      const response: RandomSnippetResponse = {
        snippet: selectedSnippet.snippet,
        collectionId: selectedSnippet.collectionId,
        collectionName: selectedSnippet.collectionName,
        totalSnippets: allSnippets.length,
      };

      return new Response(JSON.stringify(response), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache", // Don't cache random results
        },
      });
    } catch (error) {
      console.error(
        `Error fetching random snippet for ${ctx.params.lang}:`,
        error,
      );
      return new Response(
        JSON.stringify({
          error: "Failed to fetch random snippet",
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
