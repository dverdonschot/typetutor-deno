import { define } from "@/utils/define.ts";

export default define.middleware(async (ctx) => {
  const resp = await ctx.next();
  resp.headers.set("X-Content-Type-Options", "nosniff");
  return resp;
});
