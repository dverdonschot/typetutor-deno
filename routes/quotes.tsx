import { define } from "../utils.ts";
import { Layout } from "../components/Layout.tsx";
import QuoteTyperMode from "../islands/QuoteTyperMode.tsx";
import { TRANSLATION_KEYS } from "../constants/translationKeys.ts";

export default define.page(function Quotes(ctx) {
  return (
    <Layout
      descriptionKey={TRANSLATION_KEYS.PAGES.QUOTES}
      currentPath={ctx.url.pathname}
    >
      <QuoteTyperMode autoFocus />
    </Layout>
  );
});
