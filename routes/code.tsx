import { PageProps } from "$fresh/server.ts";
import { Layout } from "../components/Layout.tsx";
import CodeTyperMode from "../islands/CodeTyperMode.tsx";

export default function Code(props: PageProps) {
  return (
    <Layout
      descriptionText="Practice typing with code snippets!"
      currentPath={props.url.pathname}
    >
      <CodeTyperMode />
    </Layout>
  );
}
