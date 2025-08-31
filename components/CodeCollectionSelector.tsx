import { useEffect, useState } from "preact/hooks";

interface CodeCollectionMetadata {
  id: string;
  name: string;
  snippetCount: number;
  difficulty?: string;
  tags?: string[];
  description?: string;
}

interface CodeCollectionSelectorProps {
  languageCode: string | null;
  selectedCollectionId: string | null;
  onCollectionChange: (
    collectionId: string,
    metadata: CodeCollectionMetadata,
  ) => void;
  hideLabel?: boolean;
  label?: string;
  difficultyLabel?: string;
}

export default function CodeCollectionSelector(
  {
    languageCode,
    selectedCollectionId,
    onCollectionChange,
    hideLabel,
    label,
    difficultyLabel,
  }: CodeCollectionSelectorProps,
) {
  const [collections, setCollections] = useState<CodeCollectionMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Fetches code collection metadata for the selected language. */
  useEffect(() => {
    async function fetchCollections() {
      if (!languageCode) {
        setCollections([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/code-collections/collections/${languageCode}`,
        );
        if (!response.ok) {
          throw new Error(
            `Failed to fetch code collections: ${response.status}`,
          );
        }

        const collectionData: CodeCollectionMetadata[] = await response.json();
        setCollections(collectionData);

        // Auto-select first collection if none selected or current selection is invalid
        if (collectionData.length > 0) {
          const validCollection = collectionData.find((coll) =>
            coll.id === selectedCollectionId
          );
          if (!validCollection) {
            onCollectionChange(collectionData[0].id, collectionData[0]);
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error
          ? err.message
          : "Unknown error";
        setError(errorMessage);
        console.error(
          `Error fetching code collections for ${languageCode}:`,
          err,
        );
      } finally {
        setLoading(false);
      }
    }

    fetchCollections();
  }, [languageCode, selectedCollectionId]);

  const handleChange = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    const selectedCollection = collections.find((coll) =>
      coll.id === target.value
    );
    if (selectedCollection) {
      onCollectionChange(selectedCollection.id, selectedCollection);
    }
  };

  // Don't render if no language is selected
  if (!languageCode) {
    return (
      <div class="bg-gray-50 border border-gray-200 rounded-md p-3">
        <p class="text-sm text-gray-500">
          Select a programming language first
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
          <p class="text-sm text-red-600">
            Error loading code collections: {error}
          </p>
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

  if (collections.length === 0) {
    return (
      <div class="bg-yellow-50 border border-yellow-200 rounded-md p-3">
        <p class="text-sm text-yellow-600">
          No code collections available for this language
        </p>
      </div>
    );
  }

  return (
    <div>
      {!hideLabel && (
        <label
          htmlFor="code-collection-selector"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          {label || "Code Collection"}:
        </label>
      )}
      <select
        id="code-collection-selector"
        value={selectedCollectionId || ""}
        onChange={handleChange}
        class="block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-tt-lightblue focus:border-tt-lightblue sm:text-sm rounded-md shadow-sm bg-white border transition-colors duration-200 hover:border-gray-400"
      >
        <option value="" disabled>-- Select a code collection --</option>
        {collections.map((collection) => (
          <option key={collection.id} value={collection.id}>
            {collection.name} ({collection.snippetCount} snippets)
            {collection.difficulty ? ` - ${collection.difficulty}` : ""}
          </option>
        ))}
      </select>

      {/* Show additional collection metadata */}
      {selectedCollectionId &&
        collections.find((c) => c.id === selectedCollectionId) && (
        <div class="mt-2 text-sm text-gray-600">
          {(() => {
            const selectedCollection = collections.find((c) =>
              c.id === selectedCollectionId
            );
            if (!selectedCollection) return null;

            const parts = [];
            if (selectedCollection.tags && selectedCollection.tags.length > 0) {
              parts.push(`Tags: ${selectedCollection.tags.join(", ")}`);
            }
            if (selectedCollection.difficulty) {
              parts.push(
                `${
                  difficultyLabel || "Difficulty"
                }: ${selectedCollection.difficulty}`,
              );
            }

            return parts.length > 0 ? <p>{parts.join(" • ")}</p> : null;
          })()}
        </div>
      )}
    </div>
  );
}
