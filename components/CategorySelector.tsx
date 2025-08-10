import { useEffect, useState } from "preact/hooks";
import type { Category } from "../types/quotes.ts";

interface CategorySelectorProps {
  languageCode: string | null;
  selectedCategory: string | null;
  onCategoryChange: (categoryDirectory: string) => void;
  hideLabel?: boolean;
  isStateLoaded?: boolean;
  categoryLabel?: string;
}

export default function CategorySelector(
  {
    languageCode,
    selectedCategory,
    onCategoryChange,
    hideLabel,
    isStateLoaded = true,
    categoryLabel,
  }: CategorySelectorProps,
) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Fetches categories for the selected language. */
  useEffect(() => {
    async function fetchCategories() {
      if (!languageCode) {
        setCategories([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/quotes/categories/${languageCode}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch categories: ${response.status}`);
        }

        const categoryData: Category[] = await response.json();
        setCategories(categoryData);

        // Auto-select first category if none selected or current selection is invalid
        // But only if state has been loaded to avoid race conditions with localStorage restoration
        if (categoryData.length > 0 && isStateLoaded) {
          const validCategory = categoryData.find((cat) =>
            cat.directory === selectedCategory
          );
          if (!validCategory && selectedCategory !== null) {
            onCategoryChange(categoryData[0].directory);
          } else if (selectedCategory === null) {
            onCategoryChange(categoryData[0].directory);
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error
          ? err.message
          : "Unknown error";
        setError(errorMessage);
        console.error(`Error fetching categories for ${languageCode}:`, err);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, [languageCode, selectedCategory, onCategoryChange, isStateLoaded]);

  const handleChange = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    onCategoryChange(target.value);
  };

  // Don't render if no language is selected
  if (!languageCode) {
    return (
      <div class="bg-gray-50 border border-gray-200 rounded-md p-3">
        <p class="text-sm text-gray-500">Select a language first</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div class="animate-pulse">
        {!hideLabel && <div class="h-4 bg-gray-200 rounded mb-2 w-20"></div>}
        <div class="h-10 bg-gray-200 rounded-md"></div>
        <div class="mt-1 h-3 bg-gray-100 rounded w-32"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div class="bg-red-50 border border-red-200 rounded-md p-3">
        <div class="flex items-center justify-between">
          <p class="text-sm text-red-600">Error loading categories: {error}</p>
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

  if (categories.length === 0) {
    return (
      <div class="bg-yellow-50 border border-yellow-200 rounded-md p-3">
        <p class="text-sm text-yellow-600">
          No categories available for this language
        </p>
      </div>
    );
  }

  return (
    <div>
      {!hideLabel && (
        <label
          htmlFor="category-selector"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          {categoryLabel || "Category"}:
        </label>
      )}
      <select
        id="category-selector"
        value={selectedCategory || ""}
        onChange={handleChange}
        class="block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-tt-lightblue focus:border-tt-lightblue sm:text-sm rounded-md shadow-sm bg-white border transition-colors duration-200 hover:border-gray-400"
      >
        <option value="" disabled>-- Select a category --</option>
        {categories.map((category) => (
          <option key={category.directory} value={category.directory}>
            {category.icon ? `${category.icon} ` : ""}
            {category.name}
            {category.description ? ` - ${category.description}` : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
