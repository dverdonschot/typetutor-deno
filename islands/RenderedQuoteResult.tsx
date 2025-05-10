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
      return (
        <div>
          <div
            class="text-green-500 text-3xl sm:text-4xl md:text-5xl typing-text"
            key={`${index}-char`}
          >
            {item.char}
          </div>
          <span
            class="text-red-500 text-3xl sm:text-4xl md:text-5xl typing-text"
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
      <div class="flex justify-center items-center gap-8 py-6 mt-2 mb-2 ml-6 mr-0 flex-wrap typing-text tracking-wider">
        {RenderedQuoteResult}
      </div>
    </div>
  );
}
