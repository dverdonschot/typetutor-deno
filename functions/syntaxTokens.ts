// Per-character syntax color mapping for the code typing preview. The server
// (routes/api/highlight.ts) returns Shiki tokens with absolute string offsets;
// this expands them into one color per character index so the render loop
// stays O(1) per keystroke.

export interface SyntaxToken {
  start: number;
  end: number;
  color: string;
}

export function colorByChar(
  textLength: number,
  tokens: SyntaxToken[],
): (string | null)[] {
  const out: (string | null)[] = Array(textLength).fill(null);
  for (const token of tokens) {
    const start = Math.max(0, token.start);
    const end = Math.min(token.end, textLength);
    for (let i = start; i < end; i++) {
      out[i] = token.color;
    }
  }
  return out;
}
