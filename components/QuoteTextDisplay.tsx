import { cn } from "../functions/utils.ts";

export interface DisplayCharState {
  original: string;
  typed: string | null;
  state: 'none' | 'correct' | 'incorrect' | 'current';
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
            charToShow = ' ';
          } else if (charState.original === '\n') {
            // Render a visible character for newline and ensure a line break
            charToShow = '↵';
            return (
              <div key={index} class="inline-block">
                <span
                  class={cn(
                    "transition-colors duration-100 ease-in-out",
                    "font-bold",
                    {
                      "text-gray-500": charState.state === 'none',
                      "text-green-600": charState.state === 'correct',
                      "text-red-600 bg-red-100": charState.state === 'incorrect',
                      "bg-blue-200 rounded": charState.state === 'current',
                      "text-gray-700": charState.state === 'current',
                    }
                  )}
                >
                  {charToShow}
                </span>
                <br />
              </div>
            );
          } else if (charState.original === '\t') {
             charToShow = '    ';
          }


          return (
            <span
              key={index}
              class={cn(
                "transition-colors duration-100 ease-in-out",
                {
                  "text-gray-500": charState.state === 'none',
                  "text-green-600": charState.state === 'correct',
                  "text-red-600 bg-red-100": charState.state === 'incorrect',
                  "bg-blue-200 rounded": charState.state === 'current',
                  "text-gray-700": charState.state === 'current' && charState.original !== ' ',
                  "bg-blue-100": charState.state === 'current' && charState.original === ' ',
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