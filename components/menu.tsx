import { useState } from "preact/hooks";

export function Menu() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div class="relative">
      {/* Hamburger Button */}
      <button
        type="button"
        onClick={toggleMenu}
        class="flex items-center justify-center p-2 rounded-md text-tt-darkblue hover:bg-gray-100 focus:outline-none"
        aria-expanded={isOpen ? "true" : "false"}
      >
        <span class="sr-only">Open main menu</span>
        {/* Hamburger Icon */}
        <svg
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d={
              isOpen
                ? "M6 18L18 6M6 6l12 12" // X icon when open
                : "M4 6h16M4 12h16M4 18h16" // Hamburger icon when closed
            }
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      <div
        class={`absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10 transition-all duration-200 ${
          isOpen
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div class="py-1" role="menu" aria-orientation="vertical">
          <a
            href="/"
            class="flex items-center px-4 py-2 text-sm text-tt-darkblue hover:bg-gray-100"
            role="menuitem"
          >
            <svg
              class="w-5 h-5 mr-3 text-tt-lightblue"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
              >
              </path>
            </svg>
            Random
          </a>

          <a
            href="/alphabet"
            class="flex items-center px-4 py-2 text-sm text-tt-darkblue hover:bg-gray-100"
            role="menuitem"
          >
            <svg
              class="w-5 h-5 mr-3 text-tt-lightblue"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m13 19 3.5-9 3.5 9m-6.125-2h5.25M3 7h7m0 0h2m-2 0c0 1.63-.793 3.926-2.239 5.655M7.5 6.818V5m.261 7.655C6.79 13.82 5.521 14.725 4 15m3.761-2.345L5 10m2.761 2.655L10.2 15"
              />
            </svg>
            Alphabet
          </a>

          <a
            href="/numpad"
            class="flex items-center px-4 py-2 text-sm text-tt-darkblue hover:bg-gray-100"
            role="menuitem"
          >
            <svg
              class="w-5 h-5 mr-3 text-tt-lightblue"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M2.873 11.297V4.142H1.699L0 5.379v1.137l1.64-1.18h.06v5.961zm3.213-5.09v-.063c0-.618.44-1.169 1.196-1.169.676 0 1.174.44 1.174 1.106 0 .624-.42 1.101-.807 1.526L4.99 10.553v.744h4.78v-.99H6.643v-.069L8.41 8.252c.65-.724 1.237-1.332 1.237-2.27C9.646 4.849 8.723 4 7.308 4c-1.573 0-2.36 1.064-2.36 2.15v.057zm6.559 1.883h.786c.823 0 1.374.481 1.379 1.179.01.707-.55 1.216-1.421 1.21-.77-.005-1.326-.419-1.379-.953h-1.095c.042 1.053.938 1.918 2.464 1.918 1.478 0 2.642-.839 2.62-2.144-.02-1.143-.922-1.651-1.551-1.714v-.063c.535-.09 1.347-.66 1.326-1.678-.026-1.053-.933-1.855-2.359-1.845-1.5.005-2.317.88-2.348 1.898h1.116c.032-.498.498-.944 1.206-.944.703 0 1.206.435 1.206 1.07.005.64-.504 1.106-1.2 1.106h-.75z"
              />
            </svg>
            Numpad
          </a>

          <a
            href="/quotes"
            class="flex items-center px-4 py-2 text-sm text-tt-darkblue hover:bg-gray-100"
            role="menuitem"
          >
            <svg
              class="w-5 h-5 mr-3 text-tt-lightblue"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                fill-rule="evenodd"
                d="M6 6a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h3a3 3 0 0 1-3 3H5a1 1 0 1 0 0 2h1a5 5 0 0 0 5-5V8a2 2 0 0 0-2-2H6Zm9 0a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h3a3 3 0 0 1-3 3h-1a1 1 0 1 0 0 2h1a5 5 0 0 0 5-5V8a2 2 0 0 0-2-2h-3Z"
                clip-rule="evenodd"
              />
            </svg>
            Quotes
          </a>

          <a
            href="/custom"
            class="flex items-center px-4 py-2 text-sm text-tt-darkblue hover:bg-gray-100"
            role="menuitem"
          >
            <svg
              class="w-5 h-5 mr-3 text-tt-lightblue"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 6.2V5h11v1.2M8 5v14m-3 0h6m2-6.8V11h8v1.2M17 11v8m-1.5 0h3"
              />
            </svg>
            Custom Text
          </a>
        </div>
      </div>
    </div>
  );
}
