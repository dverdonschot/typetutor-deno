import { PageProps } from "$fresh/server.ts";
import { Layout } from "../components/Layout.tsx";
// We'll need to create a Quotes component
import { Random } from "../components/random.tsx"; // Temporarily using Random until we create a Quotes component

export default function Quotes(props: PageProps) {
  return (
    <Layout descriptionText="Practice typing with famous quotes!">
      {/* Replace with Quotes component when created */}
      <Random />
    </Layout>
  );
}