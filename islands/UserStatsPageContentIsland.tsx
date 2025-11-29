import { Head } from "fresh/runtime";
import KeyboardHeatmapIsland from "./KeyboardHeatmapIsland.tsx";
import UserStatsIsland from "./UserStatsIsland.tsx";
import { useReactiveTranslation } from "../utils/translations.ts";
import { TRANSLATION_KEYS } from "../constants/translationKeys.ts";

export default function UserStatsPageContentIsland() {
  const t = useReactiveTranslation();

  return (
    <>
      <Head>
        <title>{t(TRANSLATION_KEYS.USERSTATS.TITLE)} - TypeTutor</title>
        <meta
          name="description"
          content={t(TRANSLATION_KEYS.USERSTATS.DESCRIPTION)}
        />
      </Head>

      <div className="p-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t(TRANSLATION_KEYS.USERSTATS.TITLE)}
        </h1>
        <p className="text-gray-600 mb-8">
          {t(TRANSLATION_KEYS.USERSTATS.DESCRIPTION)}
        </p>

        {/* Stats Overview */}
        <UserStatsIsland />

        {/* Keyboard Heatmap */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">
            {t(TRANSLATION_KEYS.USERSTATS.KEYBOARD_HEATMAP_TITLE)}
          </h2>
          <p className="text-gray-600 mb-4">
            {t(TRANSLATION_KEYS.USERSTATS.KEYBOARD_HEATMAP_DESCRIPTION)}
          </p>
          <KeyboardHeatmapIsland />
        </div>
      </div>
    </>
  );
}
