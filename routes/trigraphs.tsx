import { Handlers, PageProps } from "$fresh/server.ts";
import TrigraphsTyperMode from "../islands/TrigraphsTyperMode.tsx";

export const handler: Handlers = {
  GET(_req, ctx) {
    return ctx.render();
  },
};

export default function TrigraphsPage() {
  return (
    <TrigraphsTyperMode />
  );
}