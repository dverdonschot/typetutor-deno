import { define } from "@/utils/define.ts";
import { Layout } from "../components/Layout.tsx";
import StatsPage from "../islands/StatsPage.tsx";

export default define.page(function StatsRoute(ctx) {
  return (
    <Layout
      descriptionKey="pages.serverstats"
      currentPath={ctx.url.pathname}
    >
      <StatsPage />
    </Layout>
  );
});
