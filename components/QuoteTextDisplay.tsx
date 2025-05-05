import { cn } from "../functions/utils.ts"; // Assuming utils.ts is in functions/

// Define the state for each character to be displayed
export interface DisplayCharState {
  original: string; // The character that should be typed
  typed: string | null; // The character the user actually typed, null if not typed yet or backspaced
  state: 'none' | 'correct' | 'incorrect' | 'current'; // Typing state + current cursor position
}

interface QuoteTextDisplayProps {
  charStates: DisplayCharState[];
}

export default function QuoteTextDisplay({ charStates }: QuoteTextDisplayProps) {
  return (
    <div class="p-4 bg-white rounded-lg shadow mb-4 font-mono text-lg leading-relaxed tracking-wide">
      {/* We use whitespace-pre-wrap to preserve spaces and line breaks from the source text */}
      <pre class="whitespace-pre-wrap break-words">
        {charStates.map((charState, index) => {
          let charToShow = charState.original;
          // In case of incorrect typing, maybe show the incorrect char?
          // For now, we always show the original character but color it based on state.
          // We could adjust this later if needed.

          // Handle special whitespace characters for visibility
          if (charState.original === ' ') {
            charToShow = ' '; // Render space normally, background will show cursor/errors
          } else if (charState.original === '\n') {
            // Render a visible character for newline and ensure a line break
            charToShow = '↵'; // Use a visible character for newline
            return (
              <div key={index} class="inline-block"> {/* Use inline-block to keep it in text flow */}
                <span
                  class={cn(
                    "transition-colors duration-100 ease-in-out", // Smooth color transition
                    "font-bold", // Make the newline character stand out
                    {
                      "text-gray-500": charState.state === 'none', // Untyped
                      "text-green-600": charState.state === 'correct', // Correct
                      "text-red-600 bg-red-100": charState.state === 'incorrect', // Incorrect
                      "bg-blue-200 rounded": charState.state === 'current', // Current cursor
                      "text-gray-700": charState.state === 'current', // Darker text for current
                    }
                  )}
                >
                  {charToShow}
                </span>
                <br /> {/* Explicit line break */}
              </div>
            );
          } else if (charState.original === '\t') {
             charToShow = '    '; // Replace tab with spaces for consistent rendering
          }


          return (
            <span
              key={index}
              class={cn(
                "transition-colors duration-100 ease-in-out", // Smooth color transition
                {
                  "text-gray-500": charState.state === 'none', // Untyped characters
                  "text-green-600": charState.state === 'correct', // Correctly typed
                  "text-red-600 bg-red-100": charState.state === 'incorrect', // Incorrectly typed
                  "bg-blue-200 rounded": charState.state === 'current', // Current cursor position
                  "text-gray-700": charState.state === 'current' && charState.original !== ' ', // Darker text for current char unless space
                  "bg-blue-100": charState.state === 'current' && charState.original === ' ', // Lighter bg for space cursor
                  // Removed specific red-700 for incorrect newline as the general red-600 bg-red-100 should suffice
                }
              )}
            >
              {charToShow}
            </span>
          );
        })}
      </pre>
    </div>
  );
}