// Defines the structure for individual content items (quotes or code)
export interface ContentItem {
  id: string;       // Unique identifier (e.g., 'famous-quotes-1', 'js-fizzbuzz')
  name: string;     // Display name (e.g., 'Quote: Journey of a thousand miles', 'JS: FizzBuzz')
  type: 'quote' | 'code'; // Type indicator
  sourceUrl: string; // URL to the raw text content (e.g., GitHub raw)
  language?: string; // Optional: Specify language for code items (e.g., 'javascript', 'python')
}

// The main configuration structure is just an array of these items
const typingContent: ContentItem[] = [
  // --- Quotes ---
  // Add actual URLs to raw text files here
  {
    id: 'quote-journey',
    name: 'Quote: Journey',
    type: 'quote',
    sourceUrl: '/content/quotes/journey.txt', // Relative path to local file
  },
  {
    id: 'quote-stronger',
    name: 'Quote: Stronger',
    type: 'quote',
    sourceUrl: '/content/quotes/stronger.txt', // Relative path to local file
  },
  {
    id: 'quote-life',
    name: 'Quote: Life',
    type: 'quote',
    sourceUrl: '/content/quotes/life.txt', // Relative path to local file
  },

  // --- Code: JavaScript ---
  // Using relative paths to local files for now. Can be changed to GitHub raw URLs later.
  {
    id: 'js-task-1',
    name: 'JS: Simple Function',
    type: 'code',
    language: 'javascript',
    sourceUrl: '/content/code/javascript/simple_function.js', // Relative path to local file
  },
  {
    id: 'js-task-2',
    name: 'JS: Array Iteration',
    type: 'code',
    language: 'javascript',
    sourceUrl: '/content/code/javascript/array_iteration.js', // Relative path to local file
  },
  {
    id: 'js-task-3',
    name: 'JS: FizzBuzz',
    type: 'code',
    language: 'javascript',
    sourceUrl: '/content/code/javascript/fizzbuzz.js', // Relative path to local file
  },

  // --- Code: Python ---
  // Using relative paths to local files for now. Can be changed to GitHub raw URLs later.
  {
    id: 'py-task-1',
    name: 'Python: Basic Print',
    type: 'code',
    language: 'python',
    sourceUrl: '/content/code/python/basic_print.py', // Relative path to local file
  },
  {
    id: 'py-task-2',
    name: 'Python: List Comprehension',
    type: 'code',
    language: 'python',
    sourceUrl: '/content/code/python/list_comprehension.py', // Relative path to local file
  },
];

export default typingContent;