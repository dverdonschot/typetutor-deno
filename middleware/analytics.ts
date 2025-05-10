import { FreshContext } from "$fresh/server.ts";

// Helper function to get YYYY-MM-DD string for the current date in UTC
function getCurrentDateUTC(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = (now.getUTCMonth() + 1).toString().padStart(2, "0");
  const day = now.getUTCDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Helper function to convert ArrayBuffer to hex string
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function getGameModeId(pathname: string): Promise<string> {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/quotes")) return "quotes";
  if (pathname.startsWith("/code")) return "code";
  if (pathname.startsWith("/alphabet")) return "alphabet";
  if (pathname.startsWith("/numpad")) return "numpad";
  if (pathname.startsWith("/custom")) return "custom";
  // Add more specific game modes if needed
  return "other"; // Default for non-game pages or unrecognized paths
}

export async function handler(
  req: Request,
  ctx: FreshContext,
): Promise<Response> {
  // Skip analytics for non-page requests (e.g., static assets)
  // This is a basic check; more robust checks might be needed depending on asset paths
  if (ctx.url.pathname.includes(".")) {
    // Assuming asset paths contain a dot (e.g., styles.css, logo.svg)
    // and page routes generally do not (or end in /).
    // Adjust this logic if your routing for assets/pages is different.
    if (!ctx.url.pathname.endsWith(".html") && !ctx.url.pathname.endsWith("/")) { // Allow .html if used, or trailing slash
        if (!ctx.destination || ctx.destination === "route" || ctx.destination === "notFound") {
            // Only proceed if it's a route or notFound, not 'static'
        } else if (ctx.destination === "static") {
             return await ctx.next();
        }
    }
  }


  const clientIp = ctx.remoteAddr.hostname;
  if (!clientIp) {
    console.warn("Analytics: Client IP not available.");
    return await ctx.next();
  }

  const gameModeId = await getGameModeId(ctx.url.pathname);
  const currentDate = getCurrentDateUTC();
  const saltSecret = Deno.env.get("ANALYTICS_SALT_SECRET");

  if (!saltSecret) {
    console.warn(
      "Analytics: ANALYTICS_SALT_SECRET is not set. Skipping analytics.",
    );
    return await ctx.next();
  }

  const dailySalt = currentDate + saltSecret;
  const dataToHash = clientIp + dailySalt;

  try {
    const kv = await Deno.openKv();
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      encoder.encode(dataToHash),
    );
    const hashedIp = bufferToHex(hashBuffer);

    const kvKey = [
      "daily_game_uniques",
      currentDate,
      gameModeId,
      hashedIp,
    ];
    const TTL_MS = 36 * 60 * 60 * 1000; // 36 hours

    // Check if already recorded to avoid redundant writes (optional, KV handles atomicity)
    // const existing = await kv.get(kvKey);
    // if (!existing.value) {
    //   await kv.set(kvKey, true, { expireIn: TTL_MS });
    // }
    // Simpler: just set it. If it exists, it's just an update with the same TTL.
    await kv.set(kvKey, true, { expireIn: TTL_MS });

    // console.log(`Analytics: Recorded visit for ${gameModeId} - ${currentDate} - ${hashedIp.substring(0,10)}...`);
  } catch (error) {
    console.error("Analytics: Error processing or storing analytics data:", error);
  }

  return await ctx.next();
}