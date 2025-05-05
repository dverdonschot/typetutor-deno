export interface ContentItem {
  id: string;
  name: string;
  type: 'quote' | 'code';
  sourceUrl: string;
  language?: string;
}

const typingContent: ContentItem[] = [
  // --- Quotes ---
  // Add actual URLs to raw text files here
  {
    id: 'quote-journey',
    name: 'Quote: Journey',
    type: 'quote',
    sourceUrl: '/content/quotes/journey.txt',
  },
  {
    id: 'quote-stronger',
    name: 'Quote: Stronger',
    type: 'quote',
    sourceUrl: '/content/quotes/stronger.txt',
  },
  {
    id: 'quote-life',
    name: 'Quote: Life',
    type: 'quote',
    sourceUrl: '/content/quotes/life.txt',
  },

  // --- Code: JavaScript ---
  // Using relative paths to local files for now. Can be changed to GitHub raw URLs later.
  {
    id: 'js-task-1',
    name: 'JS: Simple Function',
    type: 'code',
    language: 'javascript',
    sourceUrl: '/content/code/javascript/simple_function.js',
  },
  {
    id: 'js-task-2',
    name: 'JS: Array Iteration',
    type: 'code',
    language: 'javascript',
    sourceUrl: '/content/code/javascript/array_iteration.js',
  },
  {
    id: 'js-task-3',
    name: 'JS: FizzBuzz',
    type: 'code',
    language: 'javascript',
    sourceUrl: '/content/code/javascript/fizzbuzz.js',
  },

  // --- Code: Python ---
  // Using relative paths to local files for now. Can be changed to GitHub raw URLs later.
  {
    id: 'py-task-1',
    name: 'Python: Basic Print',
    type: 'code',
    language: 'python',
    sourceUrl: '/content/code/python/basic_print.py',
  },
  {
    id: 'py-task-2',
    name: 'Python: List Comprehension',
    type: 'code',
    language: 'python',
    sourceUrl: '/content/code/python/list_comprehension.py',
  },
];

export default typingContent;