import { PageProps } from "$fresh/server.ts";
import { Layout } from "../components/Layout.tsx";
import { Alphabet } from "../components/alphabet.tsx";

export default function alphabet(props: PageProps) {
  return (
    <Layout descriptionText="Type the Alphabet as fast as you can!!">
      <Alphabet />
    </Layout>
  );
}
