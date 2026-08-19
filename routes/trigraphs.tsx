import { define } from "../utils.ts";
import { Layout } from "../components/Layout.tsx";
import TrigraphsTyperMode from "../islands/TrigraphsTyperMode.tsx";
import { TRANSLATION_KEYS } from "../constants/translationKeys.ts";

export default define.page(function TrigraphsPage(ctx) {
  return (
    <Layout
      descriptionKey={TRANSLATION_KEYS.PAGES.TRIGRAPHS}
      currentPath={ctx.url.pathname}
    >
      <TrigraphsTyperMode />
    </Layout>
  );
});
