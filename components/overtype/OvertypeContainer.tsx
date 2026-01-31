import { JSX } from "preact";
import { useRef } from "preact/hooks";
import { OvertypeCharState } from "../../hooks/useOvertypeInput.ts";

interface OvertypeContainerProps {
  charStates: OvertypeCharState[];
  inputValue: string;
  onInputChange: (value: string) => void;
  disabled?: boolean;
}

export default function OvertypeContainer({
  charStates,
  inputValue,
  onInputChange,
  disabled = false,
}: OvertypeContainerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Note: Auto-focus removed - now handled by parent component for better timing

  // Handle input change
  const handleInput = (e: JSX.TargetedEvent<HTMLTextAreaElement, Event>) => {
    const target = e.target as HTMLTextAreaElement;
    onInputChange(target.value);
  };

  // Handle container click to focus textarea
  const handleContainerClick = () => {
    if (textareaRef.current && !disabled) {
      textareaRef.current.focus();
    }
  };

  // Render character with appropriate styling
  const renderCharacter = (charState: OvertypeCharState, index: number) => {
    let className = "overtype-char ";

    switch (charState.state) {
      case "correct":
        className += "overtype-char-correct";
        break;
      case "incorrect":
        className += "overtype-char-incorrect";
        break;
      case "current":
        className += "overtype-char-current";
        break;
      default:
        className += "overtype-char-pending";
    }

    // Handle whitespace characters
    const displayChar = charState.original === " "
      ? "\u00A0"
      : charState.original;
    const typedChar = charState.typed === " " ? "\u00A0" : charState.typed;

    return (
      <span key={index} class={className}>
        {charState.state === "incorrect" && charState.typed
          ? typedChar
          : displayChar}
      </span>
    );
  };

  return (
    <div class="overtype-container-wrapper">
      <div
        class="overtype-container"
        onClick={handleContainerClick}
        style={{ cursor: disabled ? "default" : "text" }}
      >
        {/* Transparent textarea overlay */}
        <textarea
          ref={textareaRef}
          value={inputValue}
          onInput={handleInput}
          disabled={disabled}
          class="overtype-textarea"
          spellcheck={false}
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
        />

        {/* Styled preview layer */}
        <div
          ref={previewRef}
          class="overtype-preview"
        >
          {charStates.map(renderCharacter)}
        </div>
      </div>

      <style jsx>
        {`
        .overtype-container-wrapper {
          position: relative;
          width: 100%;
          margin: 0.5rem 0;
          max-width: none;
        }

        @media (min-width: 640px) {
          .overtype-container-wrapper {
            margin: 0.75rem 0;
          }
        }

        .overtype-container {
          position: relative;
          width: 100%;
        }

        .overtype-textarea {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: transparent;
          color: transparent;
          border: none;
          outline: none;
          resize: none;
          font-family: monospace;
          font-size: 14px;
          line-height: 1.4;
          padding: 8px;
          caret-color: #000;
          z-index: 2;
        }

        @media (min-width: 640px) {
          .overtype-textarea {
            font-size: 20px;
            line-height: 1.5;
            padding: 16px;
          }
        }

        .overtype-preview {
          position: relative;
          font-family: monospace;
          font-size: 14px;
          line-height: 1.4;
          padding: 8px;
          white-space: pre-wrap;
          word-break: break-all;
          z-index: 1;
          pointer-events: none;
          min-height: 120px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          background-color: #f9fafb;
        }

        @media (min-width: 640px) {
          .overtype-preview {
            font-size: 20px;
            line-height: 1.5;
            padding: 16px;
            min-height: 400px;
          }
        }

        .overtype-char {
          position: relative;
        }

        .overtype-char-correct {
          background-color: #10b981;
          color: white;
        }

        .overtype-char-incorrect {
          background-color: #ef4444;
          color: white;
        }

        .overtype-char-current {
          background-color: #3b82f6;
          color: white;
          animation: pulse 1s infinite;
        }

        .overtype-char-pending {
          background-color: transparent;
          color: #6b7280;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}
      </style>
    </div>
  );
}
