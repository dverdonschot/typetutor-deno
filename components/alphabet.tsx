import KeyLogger from '../islands/KeyLogger.tsx';
import { PredefinedTrainingSet } from "../functions/predefinedTrainingSet.ts";

export function Alphabet() {
  const trainingSet = PredefinedTrainingSet();
  const date = new Date();
  return (
     <div class="w-full min-h-[300px] rounded-lg bg-white shadow">
        <KeyLogger codeableKeys={trainingSet}/>
      </div>
  );
}
