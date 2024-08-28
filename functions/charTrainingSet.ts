export interface TrainingChar {
    char: string;
    state: 'correct' | 'incorrect' | 'none';
    time?: number;
}

export function charTrainingSet(lenght: number, chars?: string): TrainingChar[] {
    const dlenght: number  = lenght || 10;
    const TrainingSet: TrainingChar[] = [];
    const availableChars = chars || 'abcdefghijklmnopqrstuvwxzABCDEFGHIJKLMOPQRSTUVWXYZ1234567890*&-+;:./,~][)(}{|`!@$#%^'
    const availableCharsLenght = availableChars.length;
    let counter: number = 0;

    while (counter < dlenght) {
        const randomIndex = Math.floor(Math.random() * availableCharsLenght);

        TrainingSet.push({
            char: availableChars[randomIndex],
            state: 'none',
        })
        counter++;
    }
    
    return TrainingSet;
}