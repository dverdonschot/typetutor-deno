import { CodeCollectionMetadata } from "../hooks/useCodeContent.ts";

interface CodeCollectionSelectorProps {
  collections: CodeCollectionMetadata[];
  selectedCollectionId: string | null;
  onCollectionChange: (collectionId: string) => void;
  disabled?: boolean;
}

// Presentational only: fetching and validation live in useCodeContent.
export default function CodeCollectionSelector(
  {
    collections,
    selectedCollectionId,
    onCollectionChange,
    disabled = false,
  }: CodeCollectionSelectorProps,
) {
  const handleChange = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    if (collections.some((coll) => coll.id === target.value)) {
      onCollectionChange(target.value);
    }
  };

  return (
    <div>
      <label
        htmlFor="code-collection-selector"
        class="block text-sm font-medium text-gray-700 mb-1"
      >
        Code Collection:
      </label>
      <select
        id="code-collection-selector"
        value={selectedCollectionId || ""}
        onChange={handleChange}
        disabled={disabled}
        class="block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-tt-lightblue focus:border-tt-lightblue sm:text-sm rounded-md shadow-sm bg-white border transition-colors duration-200 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {selectedCollectionId === null && (
          <option value="" disabled>-- Select a code collection --</option>
        )}
        {collections.map((collection) => (
          <option key={collection.id} value={collection.id}>
            {collection.name} ({collection.snippetCount} snippets)
            {collection.difficulty ? ` - ${collection.difficulty}` : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
