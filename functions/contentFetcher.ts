// Result type for the fetch operation
export type FetchResult<T = string> =
  | { success: true; content: T }
  | { success: false; error: string };

/**
 * Fetches text content from a given URL.
 * @param url The URL to fetch the content from (e.g., GitHub raw URL).
 * @returns A Promise resolving to a FetchResult object.
 */
export async function fetchContentFromUrl(url: string): Promise<FetchResult> {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        // Optional: Add headers if needed, e.g., for private repos
        // 'Authorization': 'token YOUR_GITHUB_TOKEN'
        "Accept": "text/plain", // Explicitly request plain text
      },
      // Add cache control if desired, e.g., 'no-cache' during development
      cache: "default",
    });

    if (!response.ok) {
      // Handle HTTP errors (e.g., 404 Not Found, 403 Forbidden)
      let errorMsg =
        `Failed to fetch content: ${response.status} ${response.statusText}`;
      try {
        // Try to get more specific error message from response body if available
        const errorBody = await response.text();
        if (errorBody) {
          errorMsg += ` - ${errorBody}`;
        }
      } catch (_) {
        // Ignore error while reading error body
      }
      console.error(`Fetch error for ${url}: ${errorMsg}`);
      return { success: false, error: errorMsg };
    }

    const textContent = await response.text();
    return { success: true, content: textContent };
  } catch (error) {
    // Handle network errors or other exceptions during fetch
    console.error(`Network or other error fetching ${url}:`, error);
    let errorMsg = "Network error or invalid URL.";
    if (error instanceof Error) {
      errorMsg = error.message;
    }
    return { success: false, error: `Fetch failed: ${errorMsg}` };
  }
}

/**
 * Fetches words for a specific trigraph from a local file.
 * @param trigraph The trigraph string (e.g., "the").
 * @returns A Promise resolving to a FetchResult object containing words separated by newlines.
 */
export async function fetchTrigraphWords(
  trigraph: string,
  count: number = 20,
): Promise<FetchResult<string[]>> {
  const endpoint = `/api/trigraphs/${trigraph}?count=${count}`;
  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Accept": "application/json", // Expect JSON response
      },
      cache: "default",
    });

    if (!response.ok) {
      let errorMsg =
        `Failed to fetch words for trigraph "${trigraph}": ${response.status} ${response.statusText}`;
      try {
        const errorBody = await response.text();
        if (errorBody) {
          errorMsg += ` - ${errorBody}`;
        }
      } catch (_) {
        // Ignore error while reading error body
      }
      console.error(`Fetch error for ${endpoint}: ${errorMsg}`);
      return { success: false, error: errorMsg };
    }

    const words = await response.json();
    if (
      !Array.isArray(words) || !words.every((item) => typeof item === "string")
    ) {
      return {
        success: false,
        error: "Invalid response format: Expected an array of strings.",
      };
    }

    return { success: true, content: words };
  } catch (error) {
    console.error(`Network or other error fetching ${endpoint}:`, error);
    let errorMsg = "Network error or invalid endpoint.";
    if (error instanceof Error) {
      errorMsg = error.message;
    }
    return {
      success: false,
      error: `Fetch failed for trigraph "${trigraph}": ${errorMsg}`,
    };
  }
}

/**
/**
 * Fetches the list of available trigraphs from a backend endpoint.
 * @returns A Promise resolving to a FetchResult object containing an array of trigraph strings.
 */
export async function fetchAvailableTrigraphs(): Promise<
  FetchResult<string[]>
> {
  const endpoint = "/api/trigraphs"; // Assuming a backend endpoint exists
  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Accept": "application/json", // Expect JSON response
      },
      cache: "default",
    });

    if (!response.ok) {
      let errorMsg =
        `Failed to fetch available trigraphs: ${response.status} ${response.statusText}`;
      try {
        const errorBody = await response.text();
        if (errorBody) {
          errorMsg += ` - ${errorBody}`;
        }
      } catch (_) {
        // Ignore error while reading error body
      }
      console.error(`Fetch error for ${endpoint}: ${errorMsg}`);
      return { success: false, error: errorMsg };
    }

    const trigraphs = await response.json();
    if (!Array.isArray(trigraphs)) {
      return {
        success: false,
        error: "Invalid response format: Expected an array of trigraphs.",
      };
    }

    return { success: true, content: trigraphs };
  } catch (error) {
    console.error(`Network or other error fetching ${endpoint}:`, error);
    let errorMsg = "Network error or invalid endpoint.";
    if (error instanceof Error) {
      errorMsg = error.message;
    }
    return {
      success: false,
      error: `Fetch failed for available trigraphs: ${errorMsg}`,
    };
  }
}
