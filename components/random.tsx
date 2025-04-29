import KeyLogger from '../islands/KeyLogger.tsx';
import { randomTrainingSet } from "../functions/randomTrainingSet.ts";

export function Random() {
  const trainingSet = randomTrainingSet(20);
  const startTime = Math.floor(Date.now() / 1000);
  return (
     <div class="w-full min-h-[300px] rounded-lg bg-white shadow">
        <KeyLogger codeableKeys={trainingSet} startTime/>
      </div>
  );
}
