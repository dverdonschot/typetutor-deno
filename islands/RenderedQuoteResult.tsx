import { TrainingChar } from "../functions/randomTrainingSet.ts";


export default function RenderedQuoteResult(results: TrainingChar[]) {

  const RenderedQuoteResult = results.map((item, index) => {
    if (item.state == 'none') {
      return <span class="text-gray-700 text-5xl" key={index}>{item.char}</span>;
    } else if (item.state == 'correct') {
      return <span class="text-green-500 text-5xl" key={index}>{item.typedChar}</span>
    } else if (item.state == 'incorrect') {
      return <div>
        <div class="text-green-500 text-5x1" key={index}>{item.char}</div>
        <span class="text-red-500 text-5xl" key={index}>{item.typedChar}</span>
      </div>
    }
  });
  
  return (
    <div>
      <div class="flex">"Hey there Type over this random string:"</div>
      <div class="flex gap-8 py-6 mt-2 mb-2 ml-6 mr-0">
        {RenderedQuoteResult}
      </div>
    </div>
  );
}
