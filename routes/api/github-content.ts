import { Handlers } from "$fresh/server.ts";
import {
  convertToGitHubRawUrl,
  fetchGitHubContent,
} from "../../utils/githubValidator.ts";

export const handler: Handlers = {
  async POST(req) {
    try {
      const { url } = await req.json();

      if (!url || typeof url !== "string") {
        return new Response(
          JSON.stringify({
            success: false,
            error: "URL is required and must be a string",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      // Try to convert to raw URL if it's a regular GitHub URL
      const rawUrl = convertToGitHubRawUrl(url) || url;

      // Fetch content from GitHub
      const result = await fetchGitHubContent(rawUrl);

      if (result.error) {
        return new Response(
          JSON.stringify({
            success: false,
            error: result.error,
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      // Extract file info from URL for metadata
      const urlMatch = rawUrl.match(
        /^https:\/\/raw\.githubusercontent\.com\/([^\/]+)\/([^\/]+)\/([^\/]+)\/(.+)$/,
      );
      let fileInfo = null;

      if (urlMatch) {
        const [, user, repo, branch, path] = urlMatch;
        const fileName = path.split("/").pop() || "unknown";
        const fileExtension = fileName.includes(".")
          ? fileName.split(".").pop()
          : "";

        fileInfo = {
          user,
          repo,
          branch,
          path,
          fileName,
          fileExtension,
          url: rawUrl,
        };
      }

      return new Response(
        JSON.stringify({
          success: true,
          content: result.content,
          fileInfo,
          contentLength: result.content.length,
        }),
        {
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : "An unknown error occurred";

      return new Response(
        JSON.stringify({
          success: false,
          error: `Server error: ${errorMessage}`,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  },
};
