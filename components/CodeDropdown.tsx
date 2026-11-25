import { useEffect, useRef, useState } from "preact/hooks";

export interface CodeDropdownOption {
  value: string;
  label: string;
}

interface CodeDropdownProps {
  options: CodeDropdownOption[];
  selected: string | null;
  onChange: (value: string) => void;
  ariaLabel: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

// Custom listbox replacing the native <select>. The native popup is closed
// and reshuffled by re-renders while it is open (a background refetch
// replacing the options, or a state change from the change-per-arrow-key
// behaviour of Linux Chrome), which made the menu feel broken. This one:
//   - freezes the option list while open (snapshot at open time), so
//     background refetches can never disturb the open popup;
//   - commits only on Enter / click — arrow keys only move the highlight,
//     so browsing options never triggers a cascade;
//   - keeps focus on the button (aria-activedescendant pattern), so the
//     textarea auto-focus timer can never steal the popup away;
//   - supports ArrowUp/Down, Home/End, Enter, Escape, mouse hover, and
//     mouse-wheel scrolling inside the popup.
export default function CodeDropdown(
  {
    options,
    selected,
    onChange,
    ariaLabel,
    disabled = false,
    placeholder = "-- Select --",
    className = "",
  }: CodeDropdownProps,
) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  // Snapshot of the options at open time — the popup renders from this,
  // never from live props, so refetches mid-browse don't reshuffle rows.
  const openOptionsRef = useRef<CodeDropdownOption[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const idRef = useRef(`code-dd-${Math.random().toString(36).slice(2, 8)}`);

  const selectedLabel = (() => {
    const found = options.find((o) => o.value === selected);
    return found ? found.label : placeholder;
  })();

  const close = () => {
    setOpen(false);
    openOptionsRef.current = [];
  };

  const openPopup = () => {
    if (options.length === 0) return;
    // Only one menu open at a time — the keyboard path (focus + ArrowDown)
    // bypasses the outside-pointerdown close, so coordinate via an event.
    globalThis.dispatchEvent(
      new CustomEvent("code-dropdown:open", { detail: idRef.current }),
    );
    openOptionsRef.current = options;
    const idx = options.findIndex((o) => o.value === selected);
    setHighlight(idx >= 0 ? idx : 0);
    setOpen(true);
  };

  const commit = (index: number) => {
    const opts = openOptionsRef.current;
    const opt = opts[index];
    if (opt && opt.value !== selected) {
      onChange(opt.value);
    }
    close();
  };

  // Close on click outside, on window blur, and when another dropdown opens.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: Event) => {
      if (!rootRef.current?.contains(e.target as Node)) close();
    };
    const onBlur = () => close();
    const onOtherOpen = (e: Event) => {
      if ((e as CustomEvent).detail !== idRef.current) close();
    };
    document.addEventListener("pointerdown", onPointerDown);
    globalThis.addEventListener("blur", onBlur);
    globalThis.addEventListener("code-dropdown:open", onOtherOpen);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      globalThis.removeEventListener("blur", onBlur);
      globalThis.removeEventListener("code-dropdown:open", onOtherOpen);
    };
  }, [open]);

  // Keep the highlighted row visible while arrowing through the popup.
  useEffect(() => {
    if (!open || highlight < 0) return;
    const item = listRef.current?.children[highlight] as HTMLElement | null;
    item?.scrollIntoView({ block: "nearest" });
  }, [open, highlight]);

  // If the selected value disappears from the live options (e.g. a language
  // switch cleared the collections) while the popup is closed, close it.
  useEffect(() => {
    if (!open) return;
    if (options.length === 0) close();
  }, [open, options.length]);

  const handleButtonKeyDown = (e: KeyboardEvent) => {
    if (disabled) return;
    if (!open) {
      if (
        e.key === "Enter" || e.key === " " || e.key === "ArrowDown" ||
        e.key === "ArrowUp"
      ) {
        e.preventDefault();
        openPopup();
      }
      return;
    }
    const opts = openOptionsRef.current;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlight((h) => (h < 0 ? 0 : Math.min(h + 1, opts.length - 1)));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlight((h) => (h < 0 ? 0 : Math.max(h - 1, 0)));
        break;
      case "Home":
        e.preventDefault();
        setHighlight(0);
        break;
      case "End":
        e.preventDefault();
        setHighlight(opts.length - 1);
        break;
      case "Enter":
        e.preventDefault();
        commit(highlight);
        break;
      case "Escape":
        e.preventDefault();
        close();
        break;
      case "Tab":
        close();
        break;
    }
  };

  return (
    <div
      ref={rootRef}
      class={`code-dropdown ${className}`}
      data-code-menu
      data-open={open ? "true" : "false"}
    >
      <button
        type="button"
        class="code-dropdown-button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => (open ? close() : openPopup())}
        onKeyDown={handleButtonKeyDown}
      >
        <span class="code-dropdown-label">{selectedLabel}</span>
        <span class="code-dropdown-caret" aria-hidden="true">▾</span>
      </button>

      {open && (
        <ul
          ref={listRef}
          class="code-dropdown-popup"
          role="listbox"
          aria-label={ariaLabel}
          aria-activedescendant={highlight >= 0
            ? `${idRef.current}-opt-${highlight}`
            : undefined}
          // Keep focus on the button while the mouse is inside the popup.
          onMouseDown={(e) => e.preventDefault()}
        >
          {openOptionsRef.current.map((opt, i) => (
            <li
              key={opt.value}
              id={`${idRef.current}-opt-${i}`}
              role="option"
              aria-selected={opt.value === selected}
              class={`code-dropdown-item${
                i === highlight ? " highlighted" : ""
              }${opt.value === selected ? " selected" : ""}`}
              onMouseEnter={() => setHighlight(i)}
              onClick={() => commit(i)}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
