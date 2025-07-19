import { Head } from "$fresh/runtime.ts";
import { PageProps } from "$fresh/server.ts";
import { Layout } from "../components/Layout.tsx";
import KeyboardHeatmapIsland from "../islands/KeyboardHeatmapIsland.tsx";
import UserStatsIsland from "../islands/UserStatsIsland.tsx";

export default function UserStatsPage(props: PageProps) {
  return (
    <Layout
      descriptionText="Track your typing progress, analyze performance trends, and visualize your keyboard usage patterns."
      currentPath={props.url.pathname}
    >
      <Head>
        <title>Your Typing Statistics - TypeTutor</title>
        <meta
          name="description"
          content="View your detailed typing statistics, performance trends, and keyboard heatmap"
        />
      </Head>

      <div className="p-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Your Typing Statistics
        </h1>
        <p className="text-gray-600 mb-8">
          Track your progress, identify areas for improvement, and see your
          typing patterns.
        </p>

        {/* Stats Overview */}
        <UserStatsIsland />

        {/* Keyboard Heatmap */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">
            Overall Keyboard Heatmap
          </h2>
          <p className="text-gray-600 mb-4">
            Visual representation of your overall typing performance across all
            games and modes. This shows accumulated data from all your typing
            sessions. Click on any key to see detailed statistics.
          </p>
          <KeyboardHeatmapIsland />
        </div>
      </div>
    </Layout>
  );
}
