export interface TrainingChar {
  char: string;
  state: "correct" | "incorrect" | "none";
  typedChar: string;
  time?: number;
}

export function randomTrainingSet(
  lenght: number,
  chars: string,
): TrainingChar[] {
  const dlenght: number = lenght;
  const TrainingSet: TrainingChar[] = [];
  const availableChars = chars;
  const availableCharsLenght = availableChars.length;
  let counter: number = 0;

  while (counter < dlenght) {
    const randomIndex = Math.floor(Math.random() * availableCharsLenght);

    TrainingSet.push({
      char: availableChars[randomIndex],
      state: "none",
      typedChar: "none",
    });
    counter++;
  }
  return TrainingSet;
}
