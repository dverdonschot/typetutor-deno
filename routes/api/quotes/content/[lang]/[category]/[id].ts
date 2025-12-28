import {
  buildQuoteCache,
  getQuoteCache,
} from "../../../../../../functions/cacheManager.ts";
import {
  getCachedQuoteMetadata,
  isCacheEmpty,
} from "../../../../../../utils/quoteCache.ts";
import { parseQuoteFile } from "../../../../../../functions/quoteParser.ts";
import { Handlers } from "fresh/compat";

export const handler: Handlers = {
  /** Returns the actual quote content for a specific file on-demand. */
  async GET(ctx) {
    try {
      const languageCode = ctx.params.lang;
      const categoryName = ctx.params.category;
      const fileId = ctx.params.id;

      if (!languageCode || !categoryName || !fileId) {
        return new Response(
          JSON.stringify({
            error: "Missing required parameters: lang, category, or id",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      // Find the file metadata from cache
      const cache = getQuoteCache();

      // If cache is empty, try to initialize it
      if (isCacheEmpty(cache)) {
        console.log("Cache is empty, attempting to build it...");
        const buildResult = await buildQuoteCache("./static/content/quotes");
        if (!buildResult.success) {
          console.error("Failed to build cache:", buildResult.error);
          return new Response(
            JSON.stringify({
              error: "Failed to build quote cache",
              details: buildResult.error,
            }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            },
          );
        }
      }

      const metadata = getCachedQuoteMetadata(
        cache,
        languageCode,
        categoryName,
      );
      const fileMetadata = metadata.find((meta) => meta.id === fileId);

      if (!fileMetadata) {
        return new Response(
          JSON.stringify({ error: `Quote file not found: ${fileId}` }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      // Read and parse the actual file content
      try {
        const content = await Deno.readTextFile(fileMetadata.filePath);
        const parseResult = parseQuoteFile(content, { validateFormat: true });

        if (!parseResult.success) {
          throw new Error(parseResult.error);
        }

        // Return the quotes with metadata
        const response = {
          metadata: fileMetadata,
          quotes: parseResult.content,
        };

        return new Response(JSON.stringify(response), {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=3600", // 1 hour cache for content
          },
        });
      } catch (fileError) {
        console.error(
          `Error reading quote file ${fileMetadata.filePath}:`,
          fileError,
        );
        return new Response(
          JSON.stringify({
            error: "Failed to read quote file",
            details: fileError instanceof Error
              ? fileError.message
              : "unknown error",
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
    } catch (error) {
      console.error(
        `Error fetching quote content for ${ctx.params.lang}/${ctx.params.category}/${ctx.params.id}:`,
        error,
      );
      return new Response(
        JSON.stringify({
          error: "Failed to fetch quote content",
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
