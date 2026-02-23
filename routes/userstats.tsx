import { define } from "@/utils/define.ts";
import { Layout } from "../components/Layout.tsx";
import UserStatsPageContentIsland from "../islands/UserStatsPageContentIsland.tsx";

export default define.page(function UserStatsPage(ctx) {
  return (
    <Layout
      descriptionKey="pages.userstats"
      currentPath={ctx.url.pathname}
    >
      <UserStatsPageContentIsland />
    </Layout>
  );
});
