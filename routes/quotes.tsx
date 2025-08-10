import { PageProps } from "$fresh/server.ts";
import { Layout } from "../components/Layout.tsx";
import NewQuoteTyperMode from "../islands/NewQuoteTyperMode.tsx";
import { TRANSLATION_KEYS } from "../constants/translationKeys.ts";

export default function Quotes(props: PageProps) {
  return (
    <Layout
      descriptionKey={TRANSLATION_KEYS.PAGES.QUOTES}
      currentPath={props.url.pathname}
    >
      <NewQuoteTyperMode autoFocus />
    </Layout>
  );
}
