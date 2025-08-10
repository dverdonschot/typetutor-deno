import { useEffect, useState } from "preact/hooks";
import type { QuoteMetadata } from "../types/quotes.ts";

interface QuoteFileSelectorProps {
  languageCode: string | null;
  categoryDirectory: string | null;
  selectedFileId: string | null;
  onFileChange: (fileId: string, metadata: QuoteMetadata) => void;
  hideLabel?: boolean;
  label?: string;
  difficultyLabel?: string;
}

export default function QuoteFileSelector(
  {
    languageCode,
    categoryDirectory,
    selectedFileId,
    onFileChange,
    hideLabel,
    label,
    difficultyLabel,
  }: QuoteFileSelectorProps,
) {
  const [quoteFiles, setQuoteFiles] = useState<QuoteMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Fetches quote file metadata for the selected language and category. */
  useEffect(() => {
    async function fetchQuoteFiles() {
      if (!languageCode || !categoryDirectory) {
        setQuoteFiles([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/quotes/metadata/${languageCode}/${categoryDirectory}`,
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch quote files: ${response.status}`);
        }

        const fileData: QuoteMetadata[] = await response.json();
        setQuoteFiles(fileData);

        // Auto-select first file if none selected or current selection is invalid
        if (fileData.length > 0) {
          const validFile = fileData.find((file) => file.id === selectedFileId);
          if (!validFile) {
            onFileChange(fileData[0].id, fileData[0]);
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error
          ? err.message
          : "Unknown error";
        setError(errorMessage);
        console.error(
          `Error fetching quote files for ${languageCode}/${categoryDirectory}:`,
          err,
        );
      } finally {
        setLoading(false);
      }
    }

    fetchQuoteFiles();
  }, [languageCode, categoryDirectory, selectedFileId, onFileChange]);

  const handleChange = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    const selectedFile = quoteFiles.find((file) => file.id === target.value);
    if (selectedFile) {
      onFileChange(selectedFile.id, selectedFile);
    }
  };

  // Don't render if no language or category is selected
  if (!languageCode || !categoryDirectory) {
    return (
      <div class="bg-gray-50 border border-gray-200 rounded-md p-3">
        <p class="text-sm text-gray-500">
          Select a language and category first
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div class="animate-pulse">
        {!hideLabel && <div class="h-4 bg-gray-200 rounded mb-2 w-24"></div>}
        <div class="h-10 bg-gray-200 rounded-md"></div>
        <div class="mt-1 h-3 bg-gray-100 rounded w-36"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div class="bg-red-50 border border-red-200 rounded-md p-3">
        <div class="flex items-center justify-between">
          <p class="text-sm text-red-600">Error loading quote files: {error}</p>
          <button
            type="button"
            onClick={() => globalThis.location.reload()}
            class="text-xs text-red-700 hover:text-red-800 underline focus:outline-none"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (quoteFiles.length === 0) {
    return (
      <div class="bg-yellow-50 border border-yellow-200 rounded-md p-3">
        <p class="text-sm text-yellow-600">
          No quote files available in this category
        </p>
      </div>
    );
  }

  return (
    <div>
      {!hideLabel && (
        <label
          htmlFor="quote-file-selector"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          {label || "Quote Collection"}:
        </label>
      )}
      <select
        id="quote-file-selector"
        value={selectedFileId || ""}
        onChange={handleChange}
        class="block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-tt-lightblue focus:border-tt-lightblue sm:text-sm rounded-md shadow-sm bg-white border transition-colors duration-200 hover:border-gray-400"
      >
        <option value="" disabled>-- Select a quote collection --</option>
        {quoteFiles.map((file) => (
          <option key={file.id} value={file.id}>
            {file.fileTitle} ({file.quoteCount} quotes)
            {file.difficulty ? ` - ${file.difficulty}` : ""}
          </option>
        ))}
      </select>

      {/* Show additional file metadata */}
      {selectedFileId && quoteFiles.find((f) => f.id === selectedFileId) && (
        <div class="mt-2 text-sm text-gray-600">
          {(() => {
            const selectedFile = quoteFiles.find((f) =>
              f.id === selectedFileId
            );
            if (!selectedFile) return null;

            const parts = [];
            if (selectedFile.tags && selectedFile.tags.length > 0) {
              parts.push(`Tags: ${selectedFile.tags.join(", ")}`);
            }
            if (selectedFile.difficulty) {
              parts.push(
                `${
                  difficultyLabel || "Difficulty"
                }: ${selectedFile.difficulty}`,
              );
            }

            return parts.length > 0 ? <p>{parts.join(" • ")}</p> : null;
          })()}
        </div>
      )}
    </div>
  );
}
