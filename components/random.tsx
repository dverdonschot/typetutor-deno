import KeyLogger from '../islands/KeyLogger.tsx';
import { randomTrainingSet } from "../functions/randomTrainingSet.ts";

interface RandomProps {
  characterLength?: number;
  characterSet?: string;
}

export function Random({ characterLength, characterSet }: RandomProps) {
  const defaultTrainingSet: string = 'abcdefghijklmnopqrstuvwxzABCDEFGHIJKLMOPQRSTUVWXYZ1234567890*&-+;:./,~][)(}{|`!@$#%^';
  const defaultCharacterLength: number = 20;
  const trainingSet = randomTrainingSet(characterLength || defaultCharacterLength, characterSet || defaultTrainingSet);
  const startTime = Math.floor(Date.now() / 1000);
  return (
      <div class="w-full min-h-[300px] rounded-lg bg-white shadow">
        <KeyLogger codeableKeys={trainingSet} startTime/>
      </div>
  );
}
