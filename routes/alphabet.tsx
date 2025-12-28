import { PageProps } from "fresh";
import { Layout } from "../components/Layout.tsx";
import { Alphabet } from "../components/alphabet.tsx";
import { TRANSLATION_KEYS } from "../constants/translationKeys.ts";

export default function alphabet(props: PageProps) {
  return (
    <Layout
      descriptionKey={TRANSLATION_KEYS.PAGES.ALPHABET}
      currentPath={props.url.pathname}
    >
      <Alphabet />
    </Layout>
  );
}
