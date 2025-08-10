import { PageProps } from "$fresh/server.ts";
import { Layout } from "../components/Layout.tsx";
import StatsPage from "../islands/StatsPage.tsx";

export default function StatsRoute(props: PageProps) {
  return (
    <Layout
      descriptionKey="pages.serverstats"
      currentPath={props.url.pathname}
    >
      <StatsPage />
    </Layout>
  );
}
