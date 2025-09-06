interface RandomToggleProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  description?: string;
}

export default function RandomToggle({
  id,
  label,
  checked,
  onChange,
  disabled = false,
  description,
}: RandomToggleProps) {
  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <div class={`random-toggle-container ${disabled ? "disabled" : ""}`}>
      <div class="random-toggle-wrapper">
        <label
          htmlFor={id}
          class="random-toggle-label"
        >
          <input
            type="checkbox"
            id={id}
            checked={checked}
            onChange={handleToggle}
            disabled={disabled}
            class="random-toggle-input sr-only"
          />
          <div class={`random-toggle-switch ${checked ? "on" : "off"}`}>
            <div class="random-toggle-knob"></div>
          </div>
          <span class="random-toggle-text">
            {label}
          </span>
        </label>
      </div>
      {description && (
        <p class="random-toggle-description">
          {description}
        </p>
      )}

      <style jsx>
        {`
        .random-toggle-container {
          margin: 0.5rem 0;
        }
        
        .random-toggle-container.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .random-toggle-wrapper {
          display: flex;
          align-items: center;
        }
        
        .random-toggle-label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          user-select: none;
        }
        
        .random-toggle-container.disabled .random-toggle-label {
          cursor: not-allowed;
        }
        
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
        
        .random-toggle-switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
          background-color: #e5e7eb;
          border-radius: 12px;
          transition: background-color 0.2s ease;
          border: 2px solid #d1d5db;
        }
        
        .random-toggle-switch.on {
          background-color: #0044aa;
          border-color: #003388;
        }
        
        .random-toggle-knob {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 16px;
          height: 16px;
          background-color: white;
          border-radius: 50%;
          transition: transform 0.2s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .random-toggle-switch.on .random-toggle-knob {
          transform: translateX(20px);
        }
        
        .random-toggle-text {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }
        
        .random-toggle-description {
          margin: 0.25rem 0 0 0;
          font-size: 0.75rem;
          color: #6b7280;
          line-height: 1.3;
        }
        
        /* Hover states */
        .random-toggle-label:hover:not(.disabled) .random-toggle-switch {
          box-shadow: 0 0 0 2px rgba(0, 68, 170, 0.1);
        }
        
        .random-toggle-label:hover:not(.disabled) .random-toggle-switch.on {
          background-color: #003388;
        }
        
        .random-toggle-label:hover:not(.disabled) .random-toggle-switch:not(.on) {
          background-color: #f3f4f6;
          border-color: #9ca3af;
        }
        
        /* Focus states */
        .random-toggle-input:focus + .random-toggle-switch {
          outline: 2px solid #0044aa;
          outline-offset: 2px;
        }
        
        /* Mobile responsiveness */
        @media (max-width: 640px) {
          .random-toggle-text {
            font-size: 0.8rem;
          }
          
          .random-toggle-description {
            font-size: 0.7rem;
          }
        }
      `}
      </style>
    </div>
  );
}
