import { define } from "@/utils/define.ts";
import { Layout } from "../components/Layout.tsx";
import { Alphabet } from "../components/alphabet.tsx";
import { TRANSLATION_KEYS } from "../constants/translationKeys.ts";

export default define.page(function AlphabetPage(ctx) {
  return (
    <Layout
      descriptionKey={TRANSLATION_KEYS.PAGES.ALPHABET}
      currentPath={ctx.url.pathname}
    >
      <Alphabet />
    </Layout>
  );
});
