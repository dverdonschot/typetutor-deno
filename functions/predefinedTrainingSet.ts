export interface TrainingChar {
  char: string;
  state: "correct" | "incorrect" | "none";
  typedChar: string;
  time?: number;
}

export function PredefinedTrainingSet(charsInOrder: string): TrainingChar[] {
  const TrainingSet: TrainingChar[] = [];
  const availableChars = charsInOrder;
  const availableCharsLenght = availableChars.length;
  let counter: number = 0;

  while (counter < availableCharsLenght) {
    availableChars.charAt(counter);

    TrainingSet.push({
      char: availableChars[counter],
      state: "none",
      typedChar: "none",
    });
    counter++;
  }

  return TrainingSet;
}
