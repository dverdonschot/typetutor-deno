// Result type for the fetch operation
export type FetchResult =
  | { success: true; content: string }
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
