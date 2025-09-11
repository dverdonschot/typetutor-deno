interface CodeSourceSelectorProps {
  selectedSource: "collections" | "github";
  onSourceChange: (source: "collections" | "github") => void;
}

export default function CodeSourceSelector({
  selectedSource,
  onSourceChange,
}: CodeSourceSelectorProps) {
  const handleChange = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    onSourceChange(target.value as "collections" | "github");
  };

  return (
    <div class="source-selector-container">
      <label
        htmlFor="code-source-selector"
        class="block text-sm font-medium text-gray-700 mb-1"
      >
        Code Source:
      </label>
      <select
        id="code-source-selector"
        value={selectedSource}
        onChange={handleChange}
        class="block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-tt-lightblue focus:border-tt-lightblue sm:text-sm rounded-md shadow-sm bg-white border transition-colors duration-200 hover:border-gray-400"
      >
        <option value="collections">📁 Predefined Collections</option>
        <option value="github">🔗 GitHub Raw URL</option>
      </select>

      {selectedSource === "collections" && (
        <div class="mt-2 text-sm text-gray-600">
          <p>
            Choose from curated code collections organized by programming
            language
          </p>
        </div>
      )}

      {selectedSource === "github" && (
        <div class="mt-2 text-sm text-gray-600">
          <p>Paste a GitHub raw URL to type over any code file from GitHub</p>
        </div>
      )}
    </div>
  );
}
