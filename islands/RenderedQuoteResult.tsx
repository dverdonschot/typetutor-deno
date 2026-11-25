import { TrainingChar } from "../functions/randomTrainingSet.ts";

export default function RenderedQuoteResult(results: TrainingChar[]) {
  const RenderedQuoteResult = results.map((item, index) => {
    if (item.state == "none") {
      return (
        <span
          class="text-tt-darkblue text-3xl sm:text-4xl md:text-5xl typing-text"
          key={index}
        >
          {item.char}
        </span>
      );
    } else if (item.state == "correct") {
      return (
        <span
          class="text-green-500 text-3xl sm:text-4xl md:text-5xl typing-text"
          key={index}
        >
          {item.typedChar}
        </span>
      );
    } else if (item.state == "incorrect") {
      // Inline error highlight (expected char on red background), matching
      // QuoteTextDisplay. Must stay a single span: a nested <div> here becomes
      // its own flex item and reflows the whole wrap on every mistake.
      return (
        <span
          class="text-red-500 bg-red-100 rounded text-3xl sm:text-4xl md:text-5xl typing-text"
          key={index}
        >
          {item.char}
        </span>
      );
    }
  });

  return (
    <div>
      <div class="flex justify-center items-center gap-8 py-6 mt-2 mb-2 ml-6 mr-0 flex-wrap typing-text tracking-wider">
        {RenderedQuoteResult}
      </div>
    </div>
  );
}
