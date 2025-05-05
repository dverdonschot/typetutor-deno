import { PageProps } from "$fresh/server.ts";
import { Layout } from "../components/Layout.tsx";
import QuoteTyperMode from "../islands/QuoteTyperMode.tsx"; // Import the island

export default function Code(props: PageProps) {
  return (
    <Layout descriptionText="Practice typing with code snippets!">
      <QuoteTyperMode contentType="code" />
    </Layout>
  );
}