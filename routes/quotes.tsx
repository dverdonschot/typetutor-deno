import { PageProps } from "$fresh/server.ts";
import { Layout } from "../components/Layout.tsx";
import QuoteTyperMode from "../islands/QuoteTyperMode.tsx"; // Import the new island

export default function Quotes(_props: PageProps) {
  return (
    <Layout descriptionText="Practice typing with famous quotes!">
      <QuoteTyperMode contentType="quote" />
    </Layout>
  );
}
