import { define } from "@/utils/define.ts";
import { Layout } from "../components/Layout.tsx";
import CodeTyperMode from "../islands/CodeTyperMode.tsx";
import { TRANSLATION_KEYS } from "../constants/translationKeys.ts";

export default define.page(function Code(ctx) {
  return (
    <Layout
      descriptionKey={TRANSLATION_KEYS.PAGES.CODE}
      currentPath={ctx.url.pathname}
    >
      <CodeTyperMode />
    </Layout>
  );
});
