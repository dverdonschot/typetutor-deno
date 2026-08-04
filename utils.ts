import { createDefine } from "fresh";

/**
 * Shared `ctx.state` shape available to middlewares, layouts, and routes.
 * Kept as a typed record (not an empty interface) to satisfy
 * `deno-lint`'s no-empty-interface rule. Add fields here as new
 * middlewares require them.
 */
export type State = Record<string, never>;

export const define = createDefine<State>();
