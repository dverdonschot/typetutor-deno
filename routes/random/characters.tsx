import { HandlerContext, Handlers, PageProps } from "$fresh/server.ts";

export const handler: Handlers = {
  async GET(_req: Request, ctx: HandlerContext) {
    const resp = await ctx.render();
    resp.headers.set("X-Custom-Header", "Hello World");
    return resp;
  },
};

export default function Page(props: PageProps) {
  return (
        <div class="container">
            <header>
                <h1>Typetutor: The place to train your Touch Typing skills!!</h1>
            </header>
            <div class="main-content">
                <nav class="menu">
                    <ul>
                        <li><a href="#">Random Words</a></li>
                        <li><a href="#">Letters</a></li>
                        <li><a href="#">Quotes</a></li>
                        <li><a href="#">Custom Text</a></li>
                    </ul>
                </nav>
                <div class="typing-field">
                    <textarea id="typefield" rows = {10} placeholder="Start typing here..."></textarea>
                </div>
            </div>
        </div>);
}