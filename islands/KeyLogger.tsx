import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { charTrainingSet } from "../functions/charTrainingSet.ts";

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

  const codeableKeys: string[] = []
  
  typedKeys.map((key) => {
    if (key === 'Backspace') {
      codeableKeys.pop();
    } else if (key === 'Control') {
      // do nothing
    } else if (key === 'Shift') {
      // do nothing
    } else if (key === 'Alt') {
      // do nothing
    } else if (key === 'Tab') {
      // do nothing 
    } else if (key === 'Enter') {
      codeableKeys.push(' \nbla \n');
    } else {
      codeableKeys.push(key);
    }
  })

  const Trainingset = charTrainingSet(10);
  console.log(Trainingset);

  return (
    <div>
      <h1>Type something:</h1>
      <h1>
        {Trainingset.map((item, index) => (
          <span key={index}>{item.char}</span>
        ))}
      </h1>
      <div class="key-logger">
        {codeableKeys.map((key, index) => (
          <span key={index}>{key}</span>
        ))}
      </div>
    </div>
  );
};

export default KeyLogger;
