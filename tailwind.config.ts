import type { Config } from "https://esm.sh/tailwindcss@latest";

export default {
  content: [
    "{routes,islands,components}/**/*.{ts,tsx}",
  ],
  theme: {
    screens: {
      "xs": "375px",
      "sm": "640px",
      "md": "768px",
      "lg": "1024px",
      "xl": "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        "tt-darkblue": "#0044aa",
        "tt-lightblue": "#5fbcd3",
      },
      height: {
        "screen-dynamic": "var(--app-height, 100vh)",
        "screen-safe": "var(--app-height-safe, 100vh)",
      },
      minHeight: {
        "screen-dynamic": "var(--app-height, 100vh)",
        "screen-safe": "var(--app-height-safe, 100vh)",
      },
    },
  },
} satisfies Config;
