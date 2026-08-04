import { define } from "../../../../utils.ts";

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

export const handler = define.handlers({
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
        for await (const dirEntry of Deno.readDir(languageDir)) {
          if (!dirEntry.isDirectory) continue;
          const catDir = `${languageDir}/${dirEntry.name}`;
          try {
            for await (const colEntry of Deno.readDir(catDir)) {
              if (
                colEntry.isFile &&
                colEntry.name.endsWith(".json") &&
                colEntry.name !== "languages.json"
              ) {
                try {
                  const colContent = await Deno.readTextFile(
                    `${catDir}/${colEntry.name}`,
                  );
                  const col: Collection = JSON.parse(colContent);
                  if (col.snippets && Array.isArray(col.snippets)) {
                    collections.push({
                      id: col.id,
                      name: col.name,
                      description: col.description,
                      icon: col.icon,
                      difficulty: col.difficulty,
                      language: col.language,
                      snippetCount: col.snippets.length,
                      tags: [],
                    });
                  }
                } catch {
                  // skip malformed collection files
                }
              }
            }
          } catch (error) {
            console.error(`Error reading category ${catDir}:`, error);
          }
        }
      } catch (error) {
        console.error(`Error reading language dir ${languageDir}:`, error);
        return new Response(
          JSON.stringify({ error: "Failed to load collections" }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      // Sort collections by difficulty (beginner -> intermediate -> advanced)
      const difficultyOrder: Record<string, number> = {
        beginner: 0,
        intermediate: 1,
        advanced: 2,
      };
      collections.sort((a, b) => {
        const da = difficultyOrder[a.difficulty] ?? 99;
        const db = difficultyOrder[b.difficulty] ?? 99;
        return da - db;
      });

      return new Response(JSON.stringify(collections), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=300",
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
});
