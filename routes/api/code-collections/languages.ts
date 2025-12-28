import { Handlers } from "fresh/compat";

export const handler: Handlers = {
  /** Returns available programming languages for code collections. */
  async GET(_ctx) {
    try {
      const languagesPath = "./static/content/code-collections/languages.json";

      let languages;
      try {
        const fileContent = await Deno.readTextFile(languagesPath);
        languages = JSON.parse(fileContent);
      } catch (error) {
        console.error("Error reading languages file:", error);
        return new Response(
          JSON.stringify({ error: "Failed to load programming languages" }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      return new Response(JSON.stringify(languages), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=3600", // 1 hour cache
        },
      });
    } catch (error) {
      console.error("Error fetching code collection languages:", error);
      return new Response(
        JSON.stringify({
          error: "Failed to fetch programming languages",
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
