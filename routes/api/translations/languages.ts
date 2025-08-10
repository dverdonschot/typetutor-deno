import { translationCache } from "../../../utils/translationCache.ts";

export async function handler(): Promise<Response> {
  try {
    const languages = await translationCache.getLanguages();

    return new Response(JSON.stringify(languages), {
      headers: {
        "content-type": "application/json",
        "cache-control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("Error fetching languages:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch languages" }),
      {
        status: 500,
        headers: { "content-type": "application/json" },
      },
    );
  }
}
