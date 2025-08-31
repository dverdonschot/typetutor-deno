import { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
  /** Returns available categories for a specific programming language. */
  async GET(_req, ctx) {
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

      let categories: Array<
        {
          id: string;
          name: string;
          description: string;
          icon: string;
          difficulty: string;
        }
      > = [];

      try {
        // Read all directories in the language folder
        for await (const dirEntry of Deno.readDir(categoryDir)) {
          if (dirEntry.isDirectory) {
            const categoryPath =
              `${categoryDir}/${dirEntry.name}/category.json`;

            try {
              const categoryData = await Deno.readTextFile(categoryPath);
              const category = JSON.parse(categoryData);
              categories.push({
                id: dirEntry.name,
                ...category,
              });
            } catch (error) {
              console.warn(`Failed to read category ${dirEntry.name}:`, error);
              // Continue with other categories
            }
          }
        }
      } catch (error) {
        console.error(
          `Error reading categories for language ${languageCode}:`,
          error,
        );
        return new Response(
          JSON.stringify({
            error: `No categories found for language: ${languageCode}`,
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      // Sort categories by difficulty (beginner -> intermediate -> advanced)
      const difficultyOrder = {
        "beginner": 1,
        "intermediate": 2,
        "advanced": 3,
      };
      categories.sort((a, b) => {
        const orderA =
          difficultyOrder[a.difficulty as keyof typeof difficultyOrder] || 99;
        const orderB =
          difficultyOrder[b.difficulty as keyof typeof difficultyOrder] || 99;
        return orderA - orderB;
      });

      return new Response(JSON.stringify(categories), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=3600", // 1 hour cache
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
};
