import { ContentItem } from "../config/typingContent.ts"; // Import the interface
import { useMemo } from "preact/hooks";

interface ContentSelectorProps {
  contentItems: ContentItem[];
  selectedId: string | null;
  onSelect: (id: string) => void; // Callback function when an item is selected
  contentType?: 'quote' | 'code'; // Optional prop to filter content by type
}

// Helper function to group content items
const groupContentItems = (items: ContentItem[]) => {
  const grouped: { [groupName: string]: ContentItem[] } = {
    "Quotes": [], // Initialize Quotes group
  };

  items.forEach(item => {
    if (item.type === 'quote') {
      grouped["Quotes"].push(item);
    } else if (item.type === 'code') {
      const lang = item.language || 'Other Code'; // Group code by language, fallback to 'Other'
      const groupName = `Code: ${lang.charAt(0).toUpperCase() + lang.slice(1)}`; // e.g., "Code: Javascript"
      if (!grouped[groupName]) {
        grouped[groupName] = [];
      }
      grouped[groupName].push(item);
    }
  });

  // Filter out empty groups (like 'Quotes' if there are none)
  return Object.entries(grouped)
    .filter(([, items]) => items.length > 0)
    .sort(([groupA], [groupB]) => {
        // Ensure "Quotes" comes first, then sort languages alphabetically
        if (groupA === "Quotes") return -1;
        if (groupB === "Quotes") return 1;
        return groupA.localeCompare(groupB);
    }); // Convert to array of [groupName, items[]] and sort
};

export default function ContentSelector({ contentItems, selectedId, onSelect, contentType }: ContentSelectorProps) {
  // Filter content items based on the contentType prop
  const filteredItems = useMemo(() => {
    if (contentType) {
      return contentItems.filter(item => item.type === contentType);
    }
    return contentItems; // If no contentType is specified, show all items
  }, [contentItems, contentType]);

  // Memoize the grouped items from the filtered list
  const groupedOptions = useMemo(() => groupContentItems(filteredItems), [filteredItems]);

  const handleChange = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    onSelect(target.value); // Call the callback with the selected item's ID
  };

  return (
    <div class="mb-4">
      <label htmlFor="content-selector" class="block text-sm font-medium text-gray-700 mb-1">
        Select Content: {/* Changed label to be more general */}
      </label>
      <select
        id="content-selector"
        value={selectedId || ""} // Controlled component
        onChange={handleChange}
        class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm bg-white border"
      >
        <option value="" disabled>-- Select an option --</option>
        {groupedOptions.map(([groupName, items]) => (
          <optgroup key={groupName} label={groupName}>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} {/* Display the item's name */}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}