import { Handlers } from "$fresh/server.ts";

interface CodeSnippet {
  code: string;
  title: string;
  description: string;
  tags: string[];
  difficulty: string;
  language: string;
}

interface CodeCollectionMetadata {
  id: string;
  fileTitle: string;
  snippetCount: number;
  difficulty?: string;
  tags?: string[];
  description?: string;
}

export const handler: Handlers = {
  /** Returns code collection metadata for a specific language and category. */
  async GET(_req, ctx) {
    try {
      const languageCode = ctx.params.lang;
      const categoryName = ctx.params.category;

      if (!languageCode) {
        return new Response(
          JSON.stringify({ error: "Language code not provided" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      if (!categoryName) {
        return new Response(
          JSON.stringify({ error: "Category name not provided" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      const categoryDir =
        `./static/content/code-collections/${languageCode}/${categoryName}`;
      const metadata: CodeCollectionMetadata[] = [];

      try {
        // Read all JSON files in the category directory
        for await (const dirEntry of Deno.readDir(categoryDir)) {
          if (
            dirEntry.isFile && dirEntry.name.endsWith(".json") &&
            dirEntry.name !== "category.json"
          ) {
            const filePath = `${categoryDir}/${dirEntry.name}`;

            try {
              const fileContent = await Deno.readTextFile(filePath);
              const snippets: CodeSnippet[] = JSON.parse(fileContent);

              if (Array.isArray(snippets) && snippets.length > 0) {
                // Extract metadata from the collection
                const fileId = dirEntry.name.replace(".json", "");
                const allTags = [...new Set(snippets.flatMap((s) => s.tags))];
                const difficulties = [
                  ...new Set(snippets.map((s) => s.difficulty)),
                ];
                const primaryDifficulty = difficulties.length === 1
                  ? difficulties[0]
                  : difficulties.includes("beginner")
                  ? "mixed (beginner+)"
                  : difficulties.includes("intermediate")
                  ? "mixed (intermediate+)"
                  : "mixed";

                metadata.push({
                  id: fileId,
                  fileTitle: fileId.split("-").map((word) =>
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(" "),
                  snippetCount: snippets.length,
                  difficulty: primaryDifficulty,
                  tags: allTags,
                  description: snippets[0]?.description || "",
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
          `Error reading collections for ${languageCode}/${categoryName}:`,
          error,
        );
        return new Response(
          JSON.stringify({
            error: `No collections found for ${languageCode}/${categoryName}`,
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      // Sort by difficulty and then by name
      const difficultyOrder = {
        "beginner": 1,
        "intermediate": 2,
        "advanced": 3,
        "mixed (beginner+)": 4,
        "mixed (intermediate+)": 5,
        "mixed": 6,
      };

      metadata.sort((a, b) => {
        const orderA =
          difficultyOrder[a.difficulty as keyof typeof difficultyOrder] || 99;
        const orderB =
          difficultyOrder[b.difficulty as keyof typeof difficultyOrder] || 99;
        if (orderA !== orderB) return orderA - orderB;
        return a.fileTitle.localeCompare(b.fileTitle);
      });

      return new Response(JSON.stringify(metadata), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=300", // 5 minutes cache
        },
      });
    } catch (error) {
      console.error(
        `Error fetching metadata for ${ctx.params.lang}/${ctx.params.category}:`,
        error,
      );
      return new Response(
        JSON.stringify({
          error: "Failed to fetch code collection metadata",
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
