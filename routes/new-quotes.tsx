import { PageProps } from "$fresh/server.ts";
import { Layout } from "../components/Layout.tsx";
import NewQuoteTyperMode from "../islands/NewQuoteTyperMode.tsx";

export default function NewQuotes(props: PageProps) {
  return (
    <Layout
      descriptionText="Practice typing with quotes using the enhanced quote system!"
      currentPath={props.url.pathname}
    >
      <NewQuoteTyperMode autoFocus />
    </Layout>
  );
}
