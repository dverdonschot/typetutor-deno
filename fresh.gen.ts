// DO NOT EDIT. This file is generated by Fresh.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import * as $_404 from "./routes/_404.tsx";
import * as $_app from "./routes/_app.tsx";
import * as $alphabet from "./routes/alphabet.tsx";
import * as $index from "./routes/index.tsx";
import * as $KeyLogger from "./islands/KeyLogger.tsx";
import * as $KeyLoggerTypedCount from "./islands/KeyLoggerTypedCount.tsx";
import * as $RenderedQuoteResult from "./islands/RenderedQuoteResult.tsx";
import * as $RenderedQuoteResultgpt from "./islands/RenderedQuoteResultgpt.tsx";
import * as $alert from "./islands/alert.tsx";
import { type Manifest } from "$fresh/server.ts";

const manifest = {
  routes: {
    "./routes/_404.tsx": $_404,
    "./routes/_app.tsx": $_app,
    "./routes/alphabet.tsx": $alphabet,
    "./routes/index.tsx": $index,
  },
  islands: {
    "./islands/KeyLogger.tsx": $KeyLogger,
    "./islands/KeyLoggerTypedCount.tsx": $KeyLoggerTypedCount,
    "./islands/RenderedQuoteResult.tsx": $RenderedQuoteResult,
    "./islands/RenderedQuoteResultgpt.tsx": $RenderedQuoteResultgpt,
    "./islands/alert.tsx": $alert,
  },
  baseUrl: import.meta.url,
} satisfies Manifest;

export default manifest;
