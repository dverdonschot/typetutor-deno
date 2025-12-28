import TrigraphsTyperMode from "../islands/TrigraphsTyperMode.tsx";
import { Handlers } from "fresh/compat";

export const handler: Handlers = {
  GET(ctx) {
    return ctx.render();
  },
};

export default function TrigraphsPage() {
  return <TrigraphsTyperMode />;
}
