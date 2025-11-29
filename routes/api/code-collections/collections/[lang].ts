import { Handlers } from "fresh/compat";

interface Collection {
  id: string;
  name: string;
  description: string;
  icon: string;
  difficulty: string;
  language: string;
  snippets: unknown[];
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

export const handler: Handlers = {
  /** Returns available collections for a specific programming language. */
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
      const collections: CollectionMetadata[] = [];

      try {
        // Read all JSON files in the language directory
        for await (const dirEntry of Deno.readDir(languageDir)) {
          if (dirEntry.isFile && dirEntry.name.endsWith(".json")) {
            const filePath = `${languageDir}/${dirEntry.name}`;

            try {
              const fileContent = await Deno.readTextFile(filePath);
              const collection: Collection = JSON.parse(fileContent);

              if (collection.snippets && Array.isArray(collection.snippets)) {
                // Extract all unique tags from snippets
                const allTags = [
                  ...new Set(
                    collection.snippets.flatMap((s: unknown) =>
                      (s as { tags?: string[] })?.tags || []
                    ),
                  ),
                ];

                collections.push({
                  id: collection.id,
                  name: collection.name,
                  description: collection.description,
                  icon: collection.icon,
                  difficulty: collection.difficulty,
                  language: collection.language,
                  snippetCount: collection.snippets.length,
                  tags: allTags,
                });
              }
            } catch (error) {
              console.warn(
                `Failed to read collection ${dirEntry.name}:`,
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

      // Sort collections by difficulty (beginner -> intermediate -> advanced)
      const difficultyOrder = {
        "beginner": 1,
        "intermediate": 2,
        "advanced": 3,
      };
      collections.sort((a, b) => {
        const orderA =
          difficultyOrder[a.difficulty as keyof typeof difficultyOrder] || 99;
        const orderB =
          difficultyOrder[b.difficulty as keyof typeof difficultyOrder] || 99;
        if (orderA !== orderB) return orderA - orderB;
        return a.name.localeCompare(b.name);
      });

      return new Response(JSON.stringify(collections), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=3600", // 1 hour cache
        },
      });
    } catch (error) {
      console.error(
        `Error fetching collections for ${ctx.params.lang}:`,
        error,
      );
      return new Response(
        JSON.stringify({
          error: "Failed to fetch collections",
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
