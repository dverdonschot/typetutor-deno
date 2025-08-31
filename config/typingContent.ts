export interface ContentItem {
  id: string;
  name: string;
  type: "code" | "trigraph";
  sourceUrl: string;
  language?: string;
}

const typingContent: ContentItem[] = [
  // --- Code: JavaScript ---
  // Using relative paths to local files for now. Can be changed to GitHub raw URLs later.
  {
    id: "js-task-1",
    name: "JS: Simple Function",
    type: "code",
    language: "javascript",
    sourceUrl: "/content/code/javascript/simple_function.js",
  },
  {
    id: "js-task-2",
    name: "JS: Array Iteration",
    type: "code",
    language: "javascript",
    sourceUrl: "/content/code/javascript/array_iteration.js",
  },
  {
    id: "js-task-3",
    name: "JS: FizzBuzz",
    type: "code",
    language: "javascript",
    sourceUrl: "/content/code/javascript/fizzbuzz.js",
  },

  // --- Code: Python ---
  // Using relative paths to local files for now. Can be changed to GitHub raw URLs later.
  {
    id: "py-task-1",
    name: "Python: Basic Print",
    type: "code",
    language: "python",
    sourceUrl: "/content/code/python/basic_print.py",
  },
  {
    id: "py-task-2",
    name: "Python: List Comprehension",
    type: "code",
    language: "python",
    sourceUrl: "/content/code/python/list_comprehension.py",
  },
  {
    id: "py-test-short",
    name: "Python: Short Test",
    type: "code",
    language: "python",
    sourceUrl: "/content/code/python/short_test.py",
  },
];

export default typingContent;
