import { type FreshContext, type PageProps } from "fresh";
import { Handlers } from "fresh/compat";

export default function App({ Component }: PageProps) {
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>TypeTutor - Improve Your Typing Skills</title>
        <link rel="stylesheet" href="/styles.css" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body class="bg-gray-50">
        <Component />
      </body>
    </html>
  );
}

export const handler: Handlers = {
  async GET(ctx: FreshContext) {
    const resp = await ctx.render();
    resp.headers.set("X-Content-Type-Options", "nosniff");
    return resp;
  },
};
