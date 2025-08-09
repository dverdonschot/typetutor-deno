import { PageProps } from "$fresh/server.ts";
import { Layout } from "../components/Layout.tsx";
import { Random } from "../components/random.tsx";

export default function RandomMode(props: PageProps) {
  return (
    <Layout
      descriptionText="Practice typing with random characters!"
      currentPath={props.url.pathname}
    >
      <Random />
    </Layout>
  );
}
