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
      <div class="card card-padded text-sm text-gray-500">
        Select a language first
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ opacity: 0.6 }}>
        {!hideLabel && <div class="form-label" style={{ width: "5rem", height: "1rem", backgroundColor: "#e5e7eb", borderRadius: "0.25rem", marginBottom: "0.5rem" }}></div>}
        <div style={{ height: "2.5rem", backgroundColor: "#e5e7eb", borderRadius: "0.375rem" }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div class="error-container">
        <div class="flex items-center justify-between">
          <p class="error-message">Error loading categories: {error}</p>
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

  if (categories.length === 0) {
    return (
      <div class="card card-padded" style={{ backgroundColor: "#fefce8", borderColor: "#fde047" }}>
        <p class="text-sm" style={{ color: "#ca8a04" }}>
          No categories available for this language
        </p>
      </div>
    );
  }

  return (
    <div>
      {!hideLabel && (
        <label htmlFor="category-selector" class="form-label">
          {categoryLabel || "Category"}:
        </label>
      )}
      <select
        id="category-selector"
        value={selectedCategory || ""}
        onChange={handleChange}
        class="form-select"
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
