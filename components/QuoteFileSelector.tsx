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
      <div class="card card-padded text-sm text-gray-500">
        Select a language and category first
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ opacity: 0.6 }}>
        {!hideLabel && <div class="form-label" style={{ width: "6rem", height: "1rem", backgroundColor: "#e5e7eb", borderRadius: "0.25rem", marginBottom: "0.5rem" }}></div>}
        <div style={{ height: "2.5rem", backgroundColor: "#e5e7eb", borderRadius: "0.375rem" }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div class="error-container">
        <div class="flex items-center justify-between">
          <p class="error-message">Error loading quote files: {error}</p>
          <button
            type="button"
            onClick={() => globalThis.location.reload()}
            class="error-link"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (quoteFiles.length === 0) {
    return (
      <div class="card card-padded" style={{ backgroundColor: "#fefce8", borderColor: "#fde047" }}>
        <p class="text-sm" style={{ color: "#ca8a04" }}>
          No quote files available in this category
        </p>
      </div>
    );
  }

  return (
    <div>
      {!hideLabel && (
        <label htmlFor="quote-file-selector" class="form-label">
          {label || "Quote Collection"}:
        </label>
      )}
      <select
        id="quote-file-selector"
        value={selectedFileId || ""}
        onChange={handleChange}
        class="form-select"
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
