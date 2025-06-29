export interface TrainingChar {
  char: string;
  state: "correct" | "incorrect" | "none";
  typedChar: string;
  time?: number;
}

export function randomTrainingSet(
  length: number,
  chars: string,
): TrainingChar[] {
  const dlength: number = length;
  const TrainingSet: TrainingChar[] = [];
  const availableChars = chars;
  const availableCharsLength = availableChars.length;
  let counter: number = 0;

  while (counter < dlength) {
    const randomIndex = Math.floor(Math.random() * availableCharsLength);

    TrainingSet.push({
      char: availableChars[randomIndex],
      state: "none",
      typedChar: "none",
    });
    counter++;
  }
  return TrainingSet;
}
