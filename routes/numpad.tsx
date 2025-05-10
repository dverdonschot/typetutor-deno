import { PageProps } from "$fresh/server.ts";
import { Layout } from "../components/Layout.tsx";
// We'll need to create a Numpad component
import { Random } from "../components/random.tsx"; // Temporarily using Random until we create a Numpad component

export default function Numpad(props: PageProps) {
  return (
    <Layout
      descriptionText="Practice your numpad typing skills!"
      currentPath={props.url.pathname}
    >
      {/* Replace with Numpad component when created */}
      <Random />
    </Layout>
  );
}
