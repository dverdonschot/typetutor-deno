import RandomSettings from '../islands/RandomSettings.tsx';

interface RandomProps {
  characterLength?: number;
  characterSet?: string;
}

export function Random({ characterLength, characterSet }: RandomProps) {
  const defaultTrainingSet: string = 'abcdefghijklmnopqrstuvwxzABCDEFGHIJKLMOPQRSTUVWXYZ1234567890*&-+;:./,~][)(}{|`!@$#%^';
  const defaultCharacterLength: number = 20;
  
  return (
    <RandomSettings 
      initialCharacterLength={characterLength || defaultCharacterLength}
      initialCharacterSet={characterSet || defaultTrainingSet}
    />
  );
}
