import type { Config } from "https://esm.sh/tailwindcss@latest";

export default {
  content: [
    "{routes,islands,components}/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "tt-darkblue": "#0044aa",
        "tt-lightblue": "#5fbcd3",
      },
    },
  },
} satisfies Config;
