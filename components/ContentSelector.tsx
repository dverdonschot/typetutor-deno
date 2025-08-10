import { ContentItem } from "../config/typingContent.ts"; // Assuming ContentItem type needs to include 'trigraph'
import { useMemo } from "preact/hooks";
import { useReactiveTranslation } from "../utils/translations.ts";
import { TRANSLATION_KEYS } from "../constants/translationKeys.ts";

interface ContentSelectorProps {
  contentItems: ContentItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  contentType?: "code" | "trigraph";
  hideLabel?: boolean; // Add optional hideLabel prop
}

const groupContentItems = (
  items: ContentItem[],
  t: (key: string) => string,
) => {
  const grouped: { [groupName: string]: ContentItem[] } = {};

  items.forEach((item) => {
    if (item.type === "code") {
      const lang = item.language || t(TRANSLATION_KEYS.CONTENT.OTHER_CODE);
      const groupName = `Code: ${lang.charAt(0).toUpperCase() + lang.slice(1)}`;
      if (!grouped[groupName]) {
        grouped[groupName] = [];
      }
      grouped[groupName].push(item);
    } else if (item.type === "trigraph") {
      const groupName = t(TRANSLATION_KEYS.CONTENT.TRIGRAPHS);
      if (!grouped[groupName]) {
        grouped[groupName] = [];
      }
      grouped[groupName].push(item);
    }
  });

  // Filter out empty groups and sort
  return Object.entries(grouped)
    .filter(([, items]) => items.length > 0)
    .sort(([groupA], [groupB]) => {
      // Ensure translated "Trigraphs" comes first, then sort code languages alphabetically
      if (groupA.includes(t(TRANSLATION_KEYS.CONTENT.TRIGRAPHS))) return -1;
      if (groupB.includes(t(TRANSLATION_KEYS.CONTENT.TRIGRAPHS))) return 1;
      return groupA.localeCompare(groupB);
    });
};

export default function ContentSelector(
  { contentItems, selectedId, onSelect, contentType, hideLabel }:
    ContentSelectorProps, // Destructure hideLabel
) {
  const t = useReactiveTranslation();
  // Filter content items based on the contentType prop
  const filteredItems = useMemo(() => {
    if (contentType) {
      return contentItems.filter((item) => item.type === contentType);
    }
    return contentItems;
  }, [contentItems, contentType]);

  // Memoize the grouped items from the filtered list
  const groupedOptions = useMemo(() => groupContentItems(filteredItems, t), [
    filteredItems,
    t,
  ]);

  const handleChange = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    onSelect(target.value);
  };

  return (
    <div>
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
