import { PageProps } from "$fresh/server.ts";
import { Layout } from "../components/Layout.tsx"; // Import the new Layout component
import { Random } from "../components/random.tsx"; // Keep Random component import

export default function Home(_props: PageProps) {
  // const date = new Date(); // Date logic seems unused, commenting out for now
  // date.setHours(date.getHours() + 1);
  return (
    <Layout descriptionText="The place to train your Touch Typing skills!!">
      <Random />
    </Layout>
  );
}
