import { define } from "@/utils/define.ts";
import { Layout } from "../components/Layout.tsx";
import { SingleLetters } from "../islands/SingleLetters.tsx";
import { TRANSLATION_KEYS } from "../constants/translationKeys.ts";

export default define.page(function Home(ctx) {
  return (
    <Layout
      descriptionKey={TRANSLATION_KEYS.PAGES.SINGLE_LETTERS}
      currentPath={ctx.url.pathname}
    >
      <SingleLetters />
    </Layout>
  );
});
