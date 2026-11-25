interface CodeSourceSelectorProps {
  selectedSource: "collections" | "github";
  onSourceChange: (source: "collections" | "github") => void;
}

// Compact segmented control for the code source, toolbar-sized.
export default function CodeSourceSelector(
  { selectedSource, onSourceChange }: CodeSourceSelectorProps,
) {
  const base =
    "px-3 py-2 text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-tt-lightblue focus:ring-inset";
  return (
    <div class="code-source-toggle" role="group" aria-label="Code source">
      <button
        type="button"
        onClick={() => onSourceChange("collections")}
        aria-pressed={selectedSource === "collections"}
        class={`${base} rounded-l-md ${
          selectedSource === "collections"
            ? "bg-tt-darkblue text-white"
            : "bg-white text-gray-700 hover:bg-gray-100"
        }`}
      >
        📁 Collections
      </button>
      <button
        type="button"
        onClick={() => onSourceChange("github")}
        aria-pressed={selectedSource === "github"}
        class={`${base} rounded-r-md ${
          selectedSource === "github"
            ? "bg-tt-darkblue text-white"
            : "bg-white text-gray-700 hover:bg-gray-100"
        }`}
      >
        🔗 GitHub
      </button>
    </div>
  );
}
