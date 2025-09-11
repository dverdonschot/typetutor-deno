import { useEffect, useState } from "preact/hooks";

interface GitHubUrlInputProps {
  value: string;
  onChange: (url: string) => void;
  onFetch: (url: string) => void;
  loading?: boolean;
  error?: string | null;
  disabled?: boolean;
}

export default function GitHubUrlInput({
  value,
  onChange,
  onFetch,
  loading = false,
  error = null,
  disabled = false,
}: GitHubUrlInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync with parent value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const validateUrl = (url: string): string | null => {
    if (!url.trim()) return null;

    // Check if it's a GitHub URL
    const githubPattern = /^https:\/\/(raw\.)?github(usercontent)?\.com\//;
    if (!githubPattern.test(url)) {
      return "URL must be from GitHub (github.com or raw.githubusercontent.com)";
    }

    // Check if it's already a raw URL or can be converted
    const rawPattern =
      /^https:\/\/raw\.githubusercontent\.com\/([^\/]+)\/([^\/]+)\/([^\/]+)\/(.+)$/;
    const blobPattern =
      /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)$/;

    if (!rawPattern.test(url) && !blobPattern.test(url)) {
      return "URL must link to a specific file (either raw URL or GitHub blob URL)";
    }

    return null;
  };

  const convertToRawUrl = (url: string): string => {
    // If already raw, return as-is
    if (url.startsWith("https://raw.githubusercontent.com/")) {
      return url;
    }

    // Convert blob URL to raw URL
    const blobPattern =
      /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)$/;
    const match = url.match(blobPattern);

    if (match) {
      const [, user, repo, branch, path] = match;
      return `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${path}`;
    }

    return url;
  };

  const handleInputChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const newValue = target.value;
    setLocalValue(newValue);

    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError(null);
    }

    // Validate on change
    const error = validateUrl(newValue);
    setValidationError(error);

    onChange(newValue);
  };

  const handleFetch = () => {
    const trimmedUrl = localValue.trim();

    if (!trimmedUrl) {
      setValidationError("Please enter a GitHub URL");
      return;
    }

    const error = validateUrl(trimmedUrl);
    if (error) {
      setValidationError(error);
      return;
    }

    // Convert to raw URL if needed
    const rawUrl = convertToRawUrl(trimmedUrl);
    if (rawUrl !== trimmedUrl) {
      setLocalValue(rawUrl);
      onChange(rawUrl);
    }

    setValidationError(null);
    onFetch(rawUrl);
  };

  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === "Enter" && !loading && !validationError) {
      handleFetch();
    }
  };

  const getPlaceholder = () => {
    return "https://github.com/user/repo/blob/main/file.js or raw URL";
  };

  const hasError = validationError || error;

  return (
    <div class="github-url-input">
      <label
        htmlFor="github-url-input"
        class="block text-sm font-medium text-gray-700 mb-1"
      >
        GitHub URL:
      </label>

      <div class="flex gap-2">
        <div class="flex-1">
          <input
            id="github-url-input"
            type="url"
            value={localValue}
            onInput={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={getPlaceholder()}
            disabled={loading || disabled}
            class={`block w-full pl-3 pr-3 py-2.5 text-base border rounded-md shadow-sm bg-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-tt-lightblue focus:border-tt-lightblue ${
              hasError
                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 hover:border-gray-400"
            }`}
          />
        </div>

        <button
          type="button"
          onClick={handleFetch}
          disabled={loading || disabled || !!validationError ||
            !localValue.trim()}
          class={`px-4 py-2.5 text-sm font-medium rounded-md border border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            loading || disabled || !!validationError || !localValue.trim()
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-tt-lightblue hover:bg-blue-600 text-white focus:ring-blue-500"
          }`}
        >
          {loading
            ? (
              <div class="flex items-center gap-1">
                <div class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full">
                </div>
                <span>Loading...</span>
              </div>
            )
            : (
              "Fetch"
            )}
        </button>
      </div>

      {/* Error display */}
      {hasError && (
        <div class="mt-2 text-sm text-red-600">
          <span class="inline-flex items-center gap-1">
            <span>⚠️</span>
            <span>{validationError || error}</span>
          </span>
        </div>
      )}

      {/* Help text */}
      {!hasError && (
        <div class="mt-2 text-sm text-gray-600">
          <p>
            Paste a GitHub file URL (will auto-convert to raw URL) or direct raw
            URL. Example:{" "}
            <code class="bg-gray-100 px-1 rounded text-xs">
              https://github.com/user/repo/blob/main/file.js
            </code>
          </p>
        </div>
      )}

      {/* URL conversion notice */}
      {localValue !== value && value && (
        <div class="mt-2 text-sm text-blue-600">
          <span class="inline-flex items-center gap-1">
            <span>ℹ️</span>
            <span>URL converted to raw format for fetching</span>
          </span>
        </div>
      )}
    </div>
  );
}
