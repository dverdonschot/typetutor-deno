// Independent content fetching for overtype mode
// Completely separate from existing fetchContentFromUrl

export interface OvertypeContentResult {
  success: boolean;
  content: string;
  error?: string;
}

export async function fetchOvertypeContent(
  url: string,
): Promise<OvertypeContentResult> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      return {
        success: false,
        content: "",
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const content = await response.text();

    if (!content.trim()) {
      return {
        success: false,
        content: "",
        error: "Content is empty",
      };
    }

    return {
      success: true,
      content: content.trim(),
    };
  } catch (error) {
    return {
      success: false,
      content: "",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
