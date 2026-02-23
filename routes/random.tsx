import { define } from "@/utils/define.ts";
import { Layout } from "../components/Layout.tsx";
import { Random } from "../components/random.tsx";
import { TRANSLATION_KEYS } from "../constants/translationKeys.ts";

export default define.page(function RandomMode(ctx) {
  return (
    <Layout
      descriptionKey={TRANSLATION_KEYS.PAGES.RANDOM}
      currentPath={ctx.url.pathname}
    >
      <Random />
    </Layout>
  );
});
