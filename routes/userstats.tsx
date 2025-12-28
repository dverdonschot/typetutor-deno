import { PageProps } from "fresh";
import { Layout } from "../components/Layout.tsx";
import UserStatsPageContentIsland from "../islands/UserStatsPageContentIsland.tsx";

export default function UserStatsPage(props: PageProps) {
  return (
    <Layout
      descriptionKey="pages.userstats"
      currentPath={props.url.pathname}
    >
      <UserStatsPageContentIsland />
    </Layout>
  );
}
