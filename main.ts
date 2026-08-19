/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

import "jsr:@std/dotenv@^0.225/load";

import { App, staticFiles } from "fresh";
import { define, type State } from "./utils.ts";
import { initializeQuoteCache } from "./functions/initializeCache.ts";
import { translationCache } from "./utils/translationCache.ts";

// Initialize caches before starting server
await initializeQuoteCache();

console.log("Initializing translation cache...");
await translationCache.getCache();
console.log("Translation cache initialized");

export const app = new App<State>();

app.use(staticFiles());

// Set the X-Content-Type-Options header on every response (matches the prior
// Fresh 1 behavior that lived in `routes/_app.tsx`'s GET handler).
app.use(define.middleware(async (ctx) => {
  const resp = await ctx.next();
  resp.headers.set("X-Content-Type-Options", "nosniff");
  return resp;
}));

app.fsRoutes();

if (import.meta.main) {
  await app.listen();
}
