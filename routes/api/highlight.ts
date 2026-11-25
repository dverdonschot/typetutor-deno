import { define } from "../../utils.ts";
import { codeToTokens } from "shiki";
import { SyntaxToken } from "../../functions/syntaxTokens.ts";

// Server-side syntax highlighting for code mode. Shiki runs only here, so the
// client bundle never pays for it. Snippet content is static, so results are
// cached per (lang, code) — effectively a 100% hit rate after first use.

const cache = new Map<string, SyntaxToken[]>();
const CACHE_LIMIT = 200;

function evictOldest() {
  const oldest = cache.keys().next().value;
  if (oldest !== undefined) cache.delete(oldest);
}

export const handler = define.handlers({
  async POST(ctx) {
    let lang = "";
    try {
      const body = await ctx.req.json();
      lang = typeof body.lang === "string" ? body.lang : "";
      const code = typeof body.code === "string" ? body.code : null;

      if (!lang || code === null) {
        return Response.json(
          { error: "lang (string) and code (string) are required" },
          { status: 400 },
        );
      }

      const key = `${lang}\u0000${code}`;
      let tokens = cache.get(key);
      if (!tokens) {
        tokens = [];
        try {
          const result = await codeToTokens(code, {
            // Shiki types demand its BundledLanguage union; aliases (js, py,
            // extensions, …) are accepted at runtime and unknown ids throw,
            // which the catch below turns into plain rendering.
            lang: lang as Parameters<typeof codeToTokens>[1]["lang"],
            theme: "github-light",
          });
          for (const line of result.tokens) {
            for (const token of line) {
              // token.offset is the absolute index in the input string,
              // newlines and \r included (verified against shiki 4.6.0).
              tokens.push({
                start: token.offset,
                end: token.offset + token.content.length,
                // github-light's default foreground, for tokens shiki leaves
                // uncolored
                color: token.color ?? "#24292e",
              });
            }
          }
        } catch {
          // Unknown language or grammar failure — fall back to plain rendering.
        }
        if (cache.size >= CACHE_LIMIT) evictOldest();
        cache.set(key, tokens);
      }

      return Response.json({ tokens });
    } catch (_error) {
      return Response.json({ tokens: [] });
    }
  },
});
