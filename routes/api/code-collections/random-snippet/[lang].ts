import { define } from "../../../../utils.ts";

interface CodeSnippet {
  code: string;
  title: string;
  description: string;
  tags: string[];
  difficulty: string;
  language: string;
  index: number;
  tip?: string;
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

export const handler = define.handlers({
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
        // Scan a single collection JSON file and add its snippets.
        const addCollection = async (filePath: string) => {
          try {
            const colContent = await Deno.readTextFile(filePath);
            const col: Collection = JSON.parse(colContent);
            if (col.snippets && Array.isArray(col.snippets)) {
              for (const snippet of col.snippets) {
                allSnippets.push({
                  snippet,
                  collectionId: col.id,
                  collectionName: col.name,
                });
              }
            }
          } catch {
            // skip malformed
          }
        };

        // Top-level collection files (e.g. rust/rust-basics.json) AND
        // category subdirectories (e.g. python/basics/*.json). Previously
        // only subdirectories were scanned, so top-level collections like
        // Rust Basics were never picked by the random button.
        for await (const catEntry of Deno.readDir(languageDir)) {
          if (
            catEntry.isFile &&
            catEntry.name.endsWith(".json") &&
            catEntry.name !== "languages.json"
          ) {
            await addCollection(`${languageDir}/${catEntry.name}`);
          } else if (catEntry.isDirectory) {
            const catDir = `${languageDir}/${catEntry.name}`;
            for await (const colEntry of Deno.readDir(catDir)) {
              if (colEntry.isFile && colEntry.name.endsWith(".json")) {
                await addCollection(`${catDir}/${colEntry.name}`);
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error reading language dir ${languageDir}:`, error);
        return new Response(
          JSON.stringify({ error: "Failed to load random snippet" }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      if (allSnippets.length === 0) {
        return new Response(
          JSON.stringify({
            error: "No snippets available for this language",
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
          "Cache-Control": "public, max-age=60",
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
});
