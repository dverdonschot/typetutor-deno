import { TrainingChar } from "../functions/randomTrainingSet.ts";

export default function RenderedQuoteResult(results: TrainingChar[]) {
  const RenderedQuoteResult = results.map((item, index) => {
    if (item.state == "none") {
      return (
        <span
          class="char-none typing-text"
          key={index}
        >
          {item.char}
        </span>
      );
    } else if (item.state == "correct") {
      return (
        <span
          class="char-correct typing-text"
          key={index}
        >
          {item.typedChar}
        </span>
      );
    } else if (item.state == "incorrect") {
      return (
        <div>
          <div
            class="char-expected typing-text"
            key={`${index}-char`}
          >
            {item.char}
          </div>
          <span
            class="char-incorrect typing-text"
            key={`${index}-typed`}
          >
            {item.typedChar}
          </span>
        </div>
      );
    }
  });

  return (
    <div>
      <div class="typing-display typing-text">
        {RenderedQuoteResult}
      </div>
    </div>
  );
}
