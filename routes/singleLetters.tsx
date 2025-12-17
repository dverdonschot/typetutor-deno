import { PageProps } from "$fresh/server.ts";
import { Layout } from "../components/Layout.tsx";
import { SingleLetters } from "../islands/SingleLetters.tsx";
import { TRANSLATION_KEYS } from "../constants/translationKeys.ts";

export default function singleLetters(props: PageProps) {
  return (
    <Layout
      descriptionKey={TRANSLATION_KEYS.PAGES.SINGLE_LETTERS}
      currentPath={props.url.pathname}
    >
      <SingleLetters />
    </Layout>
  );
}
