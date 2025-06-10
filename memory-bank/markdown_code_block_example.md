// Example of a TypeScript code block in Markdown

interface ExampleProps {
  name: string;
  age: number;
}

function greet({ name, age }: ExampleProps): void {
  console.log(`Hello, ${name}! You are ${age} years old.`);
}
```

To create a code block in Markdown, use three backticks (```) followed by the language identifier (e.g., `typescript`, `javascript`, `python`, `html`, `css`) on the first line. Close the code block with three backticks on the last line.

Example:

```language_identifier
// Your code here