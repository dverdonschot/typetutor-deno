import { translationCache } from "../../../utils/translationCache.ts";

export async function handler(): Promise<Response> {
  try {
    const allTranslations = await translationCache.getAllTranslations();

    return new Response(JSON.stringify(allTranslations), {
      headers: {
        "content-type": "application/json",
        "cache-control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("Error fetching all translations:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch translations" }),
      {
        status: 500,
        headers: { "content-type": "application/json" },
      },
    );
  }
}
