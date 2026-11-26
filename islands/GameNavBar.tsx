import { useEffect, useRef } from "preact/hooks";
import type { JSX } from "preact";

interface GameNavBarProps {
  currentPath: string;
}

interface GameLink {
  href: string;
  label: string;
  // Shorter label shown on narrow screens (keeps the bar scrolable but tidy).
  shortLabel?: string;
  icon: JSX.Element;
}

const strokeIcon = (d: string, extra?: { strokeWidth?: number }) => (
  <svg
    class="w-4 h-4 flex-shrink-0"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    stroke-width={extra?.strokeWidth ?? 2}
  >
    <path stroke-linecap="round" stroke-linejoin="round" d={d} />
  </svg>
);

const GAMES: GameLink[] = [
  {
    href: "/quotes",
    label: "Quotes",
    icon: (
      <svg
        class="w-4 h-4 flex-shrink-0"
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
    ),
  },
  {
    href: "/alphabet",
    label: "Alphabet",
    shortLabel: "Alpha",
    icon: strokeIcon(
      "m13 19 3.5-9 3.5 9m-6.125-2h5.25M3 7h7m0 0h2m-2 0c0 1.63-.793 3.926-2.239 5.655M7.5 6.818V5m.261 7.655C6.79 13.82 5.521 14.725 4 15m3.761-2.345L5 10m2.761 2.655L10.2 15",
    ),
  },
  {
    href: "/random",
    label: "Random",
    icon: strokeIcon(
      "M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 00-2-2h-2a2 2 0 00-2 2",
    ),
  },
  {
    href: "/singleLetters",
    label: "Single Letters",
    shortLabel: "Letters",
    icon: strokeIcon("M12 6v6m0 0v6m0-6h6m-6 0H6"),
  },
  {
    href: "/custom",
    label: "Custom Text",
    shortLabel: "Custom",
    icon: strokeIcon(
      "M3 6.2V5h11v1.2M8 5v14m-3 0h6m2-6.8V11h8v1.2M17 11v8m-1.5 0h3",
    ),
  },
  {
    href: "/code",
    label: "Code",
    icon: strokeIcon(
      "M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5",
    ),
  },
  {
    href: "/trigraphs",
    label: "Trigraphs",
    shortLabel: "Tri",
    icon: (
      <svg
        class="w-4 h-4 flex-shrink-0"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <text
          x="2"
          y="18"
          font-family="monospace"
          font-size="10px"
          fill="currentColor"
          font-weight="bold"
        >
          tri
        </text>
      </svg>
    ),
  },
];

// Slim game bar under the header: every game visible as a chip, the active
// one filled. On narrow screens labels shorten and the bar scrolls
// horizontally instead of wrapping. The hamburger keeps stats/settings.
export default function GameNavBar({ currentPath }: GameNavBarProps) {
  const navRef = useRef<HTMLElement>(null);
  const isActive = (href: string) =>
    href === "/singleLetters"
      ? currentPath === "/" || currentPath === "/singleLetters"
      : currentPath === href;

  // On mobile the bar is wider than the screen; make sure the ACTIVE game
  // chip is visible on load instead of the bar starting scrolled to the left.
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const active = nav.querySelector('a[aria-current="page"]');
    if (!active) return;
    const navRect = nav.getBoundingClientRect();
    const chipRect = active.getBoundingClientRect();
    if (chipRect.left < navRect.left || chipRect.right > navRect.right) {
      active.scrollIntoView({ inline: "center", block: "nearest" });
    }
  }, [currentPath]);

  const chipClass = (active: boolean) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap flex-shrink-0 transition-colors ${
      active
        ? "bg-tt-darkblue text-white"
        : "text-gray-600 hover:bg-indigo-50 hover:text-tt-darkblue"
    }`;

  return (
    <nav
      ref={navRef}
      aria-label="Games"
      class="flex items-center gap-1 bg-white rounded-lg shadow px-2 py-1.5 overflow-x-auto gamebar-scroll"
    >
      {GAMES.map((game) => {
        const active = isActive(game.href);
        return (
          <a
            key={game.href}
            href={game.href}
            aria-current={active ? "page" : undefined}
            class={chipClass(active)}
          >
            {game.icon}
            <span
              class={`chip-label ${game.shortLabel ? "hidden sm:inline" : ""}`}
            >
              {game.label}
            </span>
            {game.shortLabel && (
              <span class="chip-label sm:hidden">{game.shortLabel}</span>
            )}
          </a>
        );
      })}
      <span
        class="mx-1 h-5 w-px bg-gray-200 flex-shrink-0"
        aria-hidden="true"
      />
      <a
        href="/userstats"
        aria-current={isActive("/userstats") ? "page" : undefined}
        class={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm whitespace-nowrap flex-shrink-0 ml-auto transition-colors ${
          isActive("/userstats")
            ? "bg-tt-darkblue text-white font-semibold"
            : "text-gray-500 hover:bg-indigo-50 hover:text-tt-darkblue"
        }`}
      >
        {strokeIcon(
          "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
        )}
        <span class="chip-label hidden sm:inline">User Stats</span>
        <span class="chip-label sm:hidden">Stats</span>
      </a>
    </nav>
  );
}
