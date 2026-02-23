import { define } from "@/utils/define.ts";

export default define.page(function App({ Component }) {
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>TypeTutor - Improve Your Typing Skills</title>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body class="bg-gray-50">
        <Component />
      </body>
    </html>
  );
});
