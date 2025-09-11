export interface GitHubRawUrl {
  user: string;
  repo: string;
  branch: string;
  path: string;
  fullUrl: string;
}

export interface GitHubValidationResult {
  isValid: boolean;
  error?: string;
  parsed?: GitHubRawUrl;
}

export function validateGitHubRawUrl(url: string): GitHubValidationResult {
  if (!url || typeof url !== "string") {
    return {
      isValid: false,
      error: "URL is required and must be a string",
    };
  }

  const trimmedUrl = url.trim();

  if (!trimmedUrl) {
    return {
      isValid: false,
      error: "URL cannot be empty",
    };
  }

  // Check if it's a GitHub raw URL
  const githubRawPattern =
    /^https:\/\/raw\.githubusercontent\.com\/([^\/]+)\/([^\/]+)\/([^\/]+)\/(.+)$/;
  const match = trimmedUrl.match(githubRawPattern);

  if (!match) {
    return {
      isValid: false,
      error:
        "URL must be a GitHub raw URL (https://raw.githubusercontent.com/user/repo/branch/path)",
    };
  }

  const [, user, repo, branch, path] = match;

  // Basic validation of URL components
  if (!user || !repo || !branch || !path) {
    return {
      isValid: false,
      error: "Invalid GitHub URL format - missing required components",
    };
  }

  // Check for potentially unsafe characters
  if (
    user.includes("..") || repo.includes("..") || branch.includes("..") ||
    path.includes("..")
  ) {
    return {
      isValid: false,
      error: "URL contains potentially unsafe path components",
    };
  }

  return {
    isValid: true,
    parsed: {
      user,
      repo,
      branch,
      path,
      fullUrl: trimmedUrl,
    },
  };
}

export function convertToGitHubRawUrl(url: string): string | null {
  if (!url) return null;

  const trimmedUrl = url.trim();

  // If it's already a raw URL, return as-is
  if (trimmedUrl.startsWith("https://raw.githubusercontent.com/")) {
    return trimmedUrl;
  }

  // Try to convert regular GitHub URL to raw URL
  const githubPattern =
    /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)$/;
  const match = trimmedUrl.match(githubPattern);

  if (match) {
    const [, user, repo, branch, path] = match;
    return `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${path}`;
  }

  return null;
}

export async function fetchGitHubContent(
  url: string,
): Promise<{ content: string; error?: string }> {
  const validation = validateGitHubRawUrl(url);

  if (!validation.isValid) {
    return {
      content: "",
      error: validation.error,
    };
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        return {
          content: "",
          error:
            "File not found on GitHub. Please check the URL and ensure the file exists.",
        };
      }
      return {
        content: "",
        error:
          `Failed to fetch content: ${response.status} ${response.statusText}`,
      };
    }

    const content = await response.text();

    // Basic content validation
    if (!content.trim()) {
      return {
        content: "",
        error: "The file appears to be empty",
      };
    }

    // Check content length (reasonable limits for typing practice)
    if (content.length > 50000) {
      return {
        content: "",
        error: "File is too large for typing practice (max 50,000 characters)",
      };
    }

    if (content.length < 50) {
      return {
        content: "",
        error:
          "File is too short for meaningful typing practice (min 50 characters)",
      };
    }

    // Check if content contains mostly printable characters
    const printableChars = content.match(/[\x20-\x7E\n\r\t]/g);
    const printableRatio = printableChars
      ? printableChars.length / content.length
      : 0;

    if (printableRatio < 0.8) {
      return {
        content: "",
        error: "File contains too many non-printable characters (binary file?)",
      };
    }

    return {
      content: content.trim(),
    };
  } catch (error) {
    return {
      content: "",
      error: `Network error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}
