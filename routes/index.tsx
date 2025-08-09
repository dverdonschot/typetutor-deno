import { PageProps } from "$fresh/server.ts";
import { Layout } from "../components/Layout.tsx";
import NewQuoteTyperMode from "../islands/NewQuoteTyperMode.tsx";

export default function Home(props: PageProps) {
  return (
    <Layout
      descriptionText="The place to train your Touch Typing skills!!"
      currentPath={props.url.pathname}
    >
      <NewQuoteTyperMode autoFocus />
    </Layout>
  );
}
