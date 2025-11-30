import { PageProps } from "$fresh/server.ts";
import { Layout } from "../components/Layout.tsx";
import { Random } from "../components/random.tsx";
import { TRANSLATION_KEYS } from "../constants/translationKeys.ts";

export default function Home(props: PageProps) {
  return (
    <Layout
      descriptionKey={TRANSLATION_KEYS.PAGES.RANDOM}
      currentPath={props.url.pathname}
    >
      <Random />
    </Layout>
  );
}
