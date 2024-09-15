import KeyLogger from '../islands/KeyLogger.tsx';
import { randomTrainingSet } from "../functions/randomTrainingSet.ts";

export function Random() {
  const trainingSet = randomTrainingSet(20);
  const date = new Date();
  return (
     <div class="col-span-10 min-h-[300px] rounded-lg bg-white shadow">
        <KeyLogger codeableKeys={trainingSet}/>
      </div>
  );
}
