import { define } from "../../../../../utils.ts";

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

export const handler = define.handlers({
  /** Returns code collection metadata for a specific language and category. */
  async GET(ctx) {
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
        for await (const dirEntry of Deno.readDir(categoryDir)) {
          if (
            !dirEntry.isFile ||
            !dirEntry.name.endsWith(".json") ||
            dirEntry.name === "languages.json"
          ) continue;
          try {
            const content = await Deno.readTextFile(
              `${categoryDir}/${dirEntry.name}`,
            );
            const parsed = JSON.parse(content);
            if (parsed && Array.isArray(parsed.snippets)) {
              const id = parsed.id || dirEntry.name.replace(".json", "");
              metadata.push({
                id,
                fileTitle: parsed.name || id,
                snippetCount: parsed.snippets.length,
                difficulty: parsed.difficulty,
                tags: parsed.tags,
                description: parsed.description,
              });
            }
          } catch {
            // skip malformed files
          }
        }
      } catch (error) {
        console.error(`Error reading category dir ${categoryDir}:`, error);
        return new Response(
          JSON.stringify({ error: "Failed to load collection metadata" }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      // Sort by difficulty and then by name
      const difficultyOrder: Record<string, number> = {
        beginner: 0,
        intermediate: 1,
        advanced: 2,
      };
      metadata.sort((a, b) => {
        const da = difficultyOrder[a.difficulty ?? ""] ?? 99;
        const db = difficultyOrder[b.difficulty ?? ""] ?? 99;
        if (da !== db) return da - db;
        return a.fileTitle.localeCompare(b.fileTitle);
      });

      return new Response(JSON.stringify(metadata), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=300",
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
});
