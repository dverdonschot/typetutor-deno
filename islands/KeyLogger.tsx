import { useState, useEffect } from 'preact/hooks';
import { TrainingChar } from "../functions/randomTrainingSet.ts";
import RenderedQuoteResult from "./RenderedQuoteResult.tsx";

interface KeyLoggerNewProps {
  codeableKeys: TrainingChar[];
}

const KeyLogger: React.FC<KeyLoggerNewProps> = ({codeableKeys}) => {
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
    const currentChar = codeableKeys[typedCount];

    if (!currentChar) return; //prevent accessing undefined array elements

    codeableKeys[typedCount].time = Math.floor(Date.now() / 1000)

    if (key === 'Backspace') {
      if (typedCount > 0) typedCount--
      currentChar.state = "none"
      currentChar.typedChar = "none"
    } else if (
     ['Control', 'Shift', 'Alt', 'Tab', 'Enter', 'Escape' ].includes(key)
    ) {
      // do nothing
    } else {
      currentChar.typedChar = key
      if (currentChar.char === key) {
        currentChar.state = "correct"
      } else {
        currentChar.state = "incorrect"
      }
      typedCount++
    }
  })

  
  const quoteResult = RenderedQuoteResult(codeableKeys)
//  const typedResult = RenderedTypedResult(codeableKeys)

  return (
    <div>
      <h1>Type something Big:</h1>
      {quoteResult}
    </div>
  )
};

export default KeyLogger;
