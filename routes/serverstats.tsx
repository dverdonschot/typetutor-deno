import { PageProps } from "fresh";
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
