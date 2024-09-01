import { TrainingChar } from "../functions/charTrainingSet.ts";


export default function GamestateRandom2(results: TrainingChar[]) {

  const renderedTypingString = results.map((item, index) => {
    if (item.state == 'none') {
      return <span class="text-gray-700" key={index}>{item.char}</span>;
    } else if (item.state == 'correct') {
      return <span class="text-green-500" key={index}>{item.char}</span>;
    } else if (item.state == 'incorrect') {
      return <span class="text-red-500" key={index}>{item.char}</span>;
    }
  });

  return (
    <div class="flex gap-8 py-6 mt-2 mb-2 ml-6 mr-6">
      {renderedTypingString}
    </div>
  );
}
