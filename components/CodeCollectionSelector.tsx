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
      <select
        id="code-collection-selector"
        aria-label="Code collection"
        value={selectedCollectionId || ""}
        onChange={handleChange}
        disabled={disabled}
        class="code-select"
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
