import { PageProps } from "fresh";
import { Layout } from "../components/Layout.tsx";
import CodeTyperMode from "../islands/CodeTyperMode.tsx";
import { TRANSLATION_KEYS } from "../constants/translationKeys.ts";

export default function Home(props: PageProps) {
  return (
    <Layout
      descriptionKey={TRANSLATION_KEYS.PAGES.CODE}
      currentPath={props.url.pathname}
    >
      <CodeTyperMode />
    </Layout>
  );
}
