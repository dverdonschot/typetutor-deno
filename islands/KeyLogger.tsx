import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { TrainingChar, charTrainingSet } from "../functions/charTrainingSet.ts";
import GamestateRandom2 from "./GamestateRandom2.tsx";

const codeableKeys: TrainingChar[] = charTrainingSet(10);
const KeyLogger = () => {
  const [typedKeys, setTypedKeys] = useState<string[]>([]);

  const handleKeyPress = (event: KeyboardEvent) => {
    setTypedKeys((prevKeys) => [...prevKeys, event.key]);
  };

  useEffect(() => {
    globalThis.addEventListener('keydown', handleKeyPress);
    return () => {
      globalThis.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  //const codeableKeys: string[] = []
  let typedCount = 0;
  typedKeys.map((key) => {
    if (key === 'Backspace') {
      //codeableKeys.pop();
      typedCount--
    } else if (key === 'Control') {
      // do nothing
    } else if (key === 'Shift') {
      // do nothing
    } else if (key === 'Alt') {
      // do nothing
    } else if (key === 'Tab') {
      // do nothing 
    } else if (key === 'Enter') {
      // do nothing
    } else {
      codeableKeys[typedCount].typedChar = key
      if (codeableKeys[typedCount].char === key) {
        codeableKeys[typedCount].state = "correct"
      } else {
        codeableKeys[typedCount].state = "incorrect"
      }
      typedCount++
    }
  })

  
  const state = GamestateRandom2(codeableKeys)

  return (
    <div>
      <h1>Type something Big:</h1>

      <h1>
        {state}
        {codeableKeys.map((item, index) => (
          <span key={index}>{item.typedChar}</span>
        ))}
      </h1>
      <div class="key-logger">
        {codeableKeys.map((key, index) => (
          <span key={index}>{key.typedChar}{' '}</span>
        ))}
      </div>
    </div>
  );
};

export default KeyLogger;
