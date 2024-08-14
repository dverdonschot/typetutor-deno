import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';

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

  return (
    <div>
      <h1>Type something:</h1>
      <div class="key-logger">
        {typedKeys.map((key, index) => (
          <span key={index}>{key}</span>
        ))}
      </div>
    </div>
  );
};

export default KeyLogger;
