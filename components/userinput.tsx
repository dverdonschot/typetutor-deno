import KeyLogger from '../islands/KeyLogger.tsx';
import { charTrainingSet } from "../functions/charTrainingSet.ts";

export function Userinput() {
  const trainingSet = charTrainingSet(20);
  const date = new Date();
  return (
     <div class="col-span-10 min-h-[300px] rounded-lg bg-white shadow">
        <KeyLogger codeableKeys={trainingSet}/>
      </div>
  );
}
