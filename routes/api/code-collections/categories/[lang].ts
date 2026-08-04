import { define } from "../../../../utils.ts";

export const handler = define.handlers({
  /** Returns available categories for a specific programming language. */
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

      const categoryDir = `./static/content/code-collections/${languageCode}`;

      const categories: Array<
        {
          id: string;
          name: string;
          description: string;
          icon: string;
          difficulty: string;
        }
      > = [];

      try {
        for await (
          const dirEntry of Deno.readDir(categoryDir)
        ) {
          if (!dirEntry.isDirectory) continue;
          const catDir = `${categoryDir}/${dirEntry.name}`;
          let collectionCount = 0;
          let firstCollectionMeta: { name?: string; icon?: string } = {};
          const difficulties: string[] = [];

          for await (const colEntry of Deno.readDir(catDir)) {
            if (
              colEntry.isFile &&
              colEntry.name.endsWith(".json") &&
              colEntry.name !== "languages.json"
            ) {
              collectionCount++;
              try {
                const colContent = await Deno.readTextFile(
                  `${catDir}/${colEntry.name}`,
                );
                const col = JSON.parse(colContent);
                if (!firstCollectionMeta.name && col.name) {
                  firstCollectionMeta = {
                    name: col.name,
                    icon: col.icon,
                  };
                }
                if (col.difficulty) difficulties.push(col.difficulty);
              } catch {
                // skip malformed
              }
            }
          }

          // Pick most common difficulty (or fallback to first)
          const difficultyCount: Record<string, number> = {};
          for (const d of difficulties) {
            difficultyCount[d] = (difficultyCount[d] || 0) + 1;
          }
          const difficulty = Object.entries(difficultyCount).sort((a, b) =>
            b[1] - a[1]
          )[0]?.[0] ?? "beginner";

          categories.push({
            id: dirEntry.name,
            name: firstCollectionMeta.name || dirEntry.name,
            description: `${collectionCount} collection${
              collectionCount === 1 ? "" : "s"
            }`,
            icon: firstCollectionMeta.icon || "📁",
            difficulty,
          });
        }
      } catch (error) {
        console.error(`Error reading category dir ${categoryDir}:`, error);
        return new Response(
          JSON.stringify({ error: "Failed to load categories" }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      // Sort categories by difficulty (beginner -> intermediate -> advanced)
      const difficultyOrder: Record<string, number> = {
        beginner: 0,
        intermediate: 1,
        advanced: 2,
      };
      categories.sort((a, b) => {
        const da = difficultyOrder[a.difficulty] ?? 99;
        const db = difficultyOrder[b.difficulty] ?? 99;
        return da - db;
      });

      return new Response(JSON.stringify(categories), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=300",
        },
      });
    } catch (error) {
      console.error(`Error fetching categories for ${ctx.params.lang}:`, error);
      return new Response(
        JSON.stringify({
          error: "Failed to fetch categories",
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
