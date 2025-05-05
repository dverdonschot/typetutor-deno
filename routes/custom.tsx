import { PageProps } from "$fresh/server.ts";
import { Layout } from "../components/Layout.tsx";
// We'll need to create a Custom component
import { Random } from "../components/random.tsx"; // Temporarily using Random until we create a Custom component

export default function Custom(props: PageProps) {
  return (
    <Layout descriptionText="Practice typing with your own custom text!">
      {/* Replace with Custom component when created */}
      <Random />
    </Layout>
  );
}