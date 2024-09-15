import { useState, useEffect } from 'preact/hooks';
import { TrainingChar } from "../functions/randomTrainingSet.ts";
import RenderedQuoteResult from "./RenderedQuoteResult.tsx";

interface KeyLoggerNewProps {
  codeableKeys: TrainingChar[];
}

const KeyLogger: React.FC<KeyLoggerNewProps> = ({codeableKeys}) => {
  const [typedKeys, setTypedKeys] = useState<string[]>([]);
  const [typedCount, setTypedCount] = useState(0);


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
  //let typedCount = 0;
  typedKeys.map((key) => {
    codeableKeys[typedCount].time = Math.floor(Date.now() / 1000)
    if (key === 'Backspace') {
      if (typedCount > 0) setTypedCount(typedCount - 1);
      codeableKeys[typedCount].state = "none"
      codeableKeys[typedCount].typedChar = "none"
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
    } else if (key === 'Escape') {
      // do nothing
    } else {
      codeableKeys[typedCount].typedChar = key
      if (codeableKeys[typedCount].char === key) {
        codeableKeys[typedCount].state = "correct"
      } else {
        codeableKeys[typedCount].state = "incorrect"
      }
      setTypedCount(typedCount + 1);
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
