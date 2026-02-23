export interface DisplayCharState {
  original: string;
  typed: string | null;
  state: "none" | "correct" | "incorrect" | "current";
}

interface QuoteTextDisplayProps {
  charStates: DisplayCharState[];
}

// Helper function to get the CSS class for a character state
function getCharClass(state: string, isSpace: boolean = false): string {
  switch (state) {
    case "none":
      return "char-none typing-text";
    case "correct":
      return "char-correct typing-text";
    case "incorrect":
      return "char-incorrect typing-text";
    case "current":
      return isSpace
        ? "char-current char-current-space typing-text"
        : "char-current typing-text";
    default:
      return "char-none typing-text";
  }
}

export default function QuoteTextDisplay(
  { charStates }: QuoteTextDisplayProps,
) {
  return (
    <div class="quote-text-container typing-text">
      <pre class="quote-text-pre">
        {charStates.map((charState, index) => {
          let charToShow = charState.original;

          // Handle special whitespace characters for visibility
          if (charState.original === " ") {
            charToShow = " ";
          } else if (charState.original === "\n") {
            // Render a visible character for newline and ensure a line break
            charToShow = "↵";
            return (
              <span key={index} style={{ display: "inline-block" }}>
                <span class={getCharClass(charState.state)} style={{ fontWeight: "bold" }}>
                  {charToShow}
                </span>
                <br />
              </span>
            );
          } else if (charState.original === "\t") {
            charToShow = "    ";
          }

          return (
            <span
              key={index}
              class={getCharClass(charState.state, charState.original === " ")}
            >
              {charToShow}
            </span>
          );
        })}
      </pre>
    </div>
  );
}