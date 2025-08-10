import { PageProps } from "$fresh/server.ts";
import { Layout } from "../components/Layout.tsx";
// We'll need to create a Custom component
import { Random } from "../components/random.tsx"; // Temporarily using Random until we create a Custom component
import { TRANSLATION_KEYS } from "../constants/translationKeys.ts";

export default function Custom(props: PageProps) {
  return (
    <Layout
      descriptionKey={TRANSLATION_KEYS.PAGES.CUSTOM}
      currentPath={props.url.pathname}
    >
      {/* Replace with Custom component when created */}
      <Random />
    </Layout>
  );
}
