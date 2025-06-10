import { ContentItem } from "../config/typingContent.ts"; // Assuming ContentItem type needs to include 'trigraph'
import { useMemo } from "preact/hooks";

interface ContentSelectorProps {
  contentItems: ContentItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  contentType?: "quote" | "code" | "trigraph"; // Add 'trigraph' to the union type
  hideLabel?: boolean; // Add optional hideLabel prop
}

const groupContentItems = (items: ContentItem[]) => {
  const grouped: { [groupName: string]: ContentItem[] } = {
    "Quotes": [],
  };

  items.forEach((item) => {
    if (item.type === "quote") {
      grouped["Quotes"].push(item);
    } else if (item.type === "code") {
      const lang = item.language || "Other Code";
      const groupName = `Code: ${lang.charAt(0).toUpperCase() + lang.slice(1)}`;
      if (!grouped[groupName]) {
        grouped[groupName] = [];
      }
      grouped[groupName].push(item);
    } else if (item.type === "trigraph") { // Handle 'trigraph' type
      const groupName = "Trigraphs";
      if (!grouped[groupName]) {
        grouped[groupName] = [];
      }
      grouped[groupName].push(item);
    }
  });

  // Filter out empty groups
  return Object.entries(grouped)
    .filter(([, items]) => items.length > 0)
    .sort(([groupA], [groupB]) => {
      // Ensure "Quotes" comes first, then sort languages alphabetically
      // Ensure "Quotes" comes first, then "Trigraphs", then sort others alphabetically
      if (groupA === "Quotes") return -1;
      if (groupB === "Quotes") return 1;
      if (groupA === "Trigraphs") return -1;
      if (groupB === "Trigraphs") return 1;
      return groupA.localeCompare(groupB);
    });
};

export default function ContentSelector(
  { contentItems, selectedId, onSelect, contentType, hideLabel }:
    ContentSelectorProps, // Destructure hideLabel
) {
  // Filter content items based on the contentType prop
  const filteredItems = useMemo(() => {
    if (contentType) {
      return contentItems.filter((item) => item.type === contentType);
    }
    return contentItems;
  }, [contentItems, contentType]);

  // Memoize the grouped items from the filtered list
  const groupedOptions = useMemo(() => groupContentItems(filteredItems), [
    filteredItems,
  ]);

  const handleChange = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    onSelect(target.value);
  };

  return (
    <div class="mb-4">
      {!hideLabel && ( // Conditionally render the label
        <label
          htmlFor="content-selector"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          Select Content:
        </label>
      )}
      <select
        id="content-selector"
        value={selectedId || ""}
        onChange={handleChange}
        class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm bg-white border"
      >
        <option value="" disabled>-- Select an option --</option>
        {groupedOptions.map(([groupName, items]) => (
          <optgroup key={groupName} label={groupName}>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}
