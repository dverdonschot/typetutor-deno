import { HandlerContext } from "$fresh/server.ts";
import { translationCache } from "../../../utils/translationCache.ts";

export async function handler(
  _req: Request,
  ctx: HandlerContext,
): Promise<Response> {
  const { lang } = ctx.params;

  try {
    const translations = await translationCache.getTranslations(lang);

    return new Response(JSON.stringify(translations), {
      headers: {
        "content-type": "application/json",
        "cache-control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error(`Error fetching translations for ${lang}:`, error);
    return new Response(
      JSON.stringify({ error: `Failed to fetch translations for ${lang}` }),
      {
        status: 500,
        headers: { "content-type": "application/json" },
      },
    );
  }
}
