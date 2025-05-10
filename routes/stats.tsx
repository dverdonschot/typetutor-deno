import { Handlers, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import Layout from "../components/Layout.tsx"; // Assuming a Layout component exists

// Helper function to get YYYY-MM-DD string for a given date in UTC
function formatDateUTC(date: Date): string {
  const year = date.getUTCFullYear();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const day = date.getUTCDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Helper function to parse YYYY-MM-DD string to a Date object (UTC)
function parseDateUTC(dateString: string): Date | null {
  const parts = dateString.split("-");
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
    const day = parseInt(parts[2], 10);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      return new Date(Date.UTC(year, month, day));
    }
  }
  return null;
}

const KNOWN_GAME_MODES = [
  "home",
  "quotes",
  "code",
  "alphabet",
  "numpad",
  "custom",
  "other", // To catch any others logged by middleware
];

interface StatsData {
  selectedDate: string;
  perGameCounts: Record<string, number>;
  totalUniqueUsers: number;
  error?: string;
}

export const handler: Handlers<StatsData> = {
  async GET(req, ctx) {
    const url = new URL(req.url);
    const dateParam = url.searchParams.get("date");
    
    let selectedDateObj: Date;
    if (dateParam) {
      const parsed = parseDateUTC(dateParam);
      if (parsed) {
        selectedDateObj = parsed;
      } else {
        // Handle invalid date format gracefully, default to today
        console.warn(`Invalid date parameter: ${dateParam}. Defaulting to today.`);
        selectedDateObj = new Date(); 
      }
    } else {
      selectedDateObj = new Date(); // Default to today
    }
    const selectedDateStr = formatDateUTC(selectedDateObj);

    const perGameCounts: Record<string, number> = {};
    const dailyTotalUniqueHashes = new Set<string>();
    let kvError: string | undefined = undefined;

    try {
      const kv = await Deno.openKv();
      for (const gameModeId of KNOWN_GAME_MODES) {
        const entries = kv.list({
          prefix: ["daily_game_uniques", selectedDateStr, gameModeId],
        });
        let countForGameMode = 0;
        for await (const entry of entries) {
          countForGameMode++;
          // The last part of the key is the hashed IP
          if (entry.key.length === 4) { // ["daily_game_uniques", date, gameMode, hash]
            dailyTotalUniqueHashes.add(entry.key[3] as string);
          }
        }
        perGameCounts[gameModeId] = countForGameMode;
      }
    } catch (error) {
      console.error("Error fetching stats from Deno KV:", error);
      kvError = "Could not retrieve statistics at this time.";
    }

    const totalUniqueUsers = dailyTotalUniqueHashes.size;

    return ctx.render({
      selectedDate: selectedDateStr,
      perGameCounts,
      totalUniqueUsers,
      error: kvError,
    });
  },
};

export default function StatsPage({ data, url }: PageProps<StatsData>) {
  const { selectedDate, perGameCounts, totalUniqueUsers, error } = data;

  const currentDateObj = parseDateUTC(selectedDate) || new Date();
  const prevDate = new Date(currentDateObj);
  prevDate.setUTCDate(currentDateObj.getUTCDate() - 1);
  const nextDate = new Date(currentDateObj);
  nextDate.setUTCDate(currentDateObj.getUTCDate() + 1);

  const prevDateStr = formatDateUTC(prevDate);
  const nextDateStr = formatDateUTC(nextDate);
  const todayStr = formatDateUTC(new Date());

  return (
    <Layout currentPath={url.pathname}>
      <Head>
        <title>Usage Statistics - Typetutor</title>
        <meta name="description" content={`Daily unique user statistics for typetutor.org on ${selectedDate}`} />
      </Head>
      <div class="container mx-auto p-4">
        <h1 class="text-3xl font-bold mb-6 text-center">Usage Statistics</h1>
        
        <div class="text-center mb-6">
          <a href={`/stats?date=${prevDateStr}`} class="text-indigo-600 hover:text-indigo-800 px-3 py-1 border rounded-md">< Previous Day</a>
          <span class="font-semibold text-xl mx-4">{selectedDate}</span>
          {selectedDate !== todayStr && (
             <a href={`/stats?date=${nextDateStr}`} class="text-indigo-600 hover:text-indigo-800 px-3 py-1 border rounded-md">Next Day ></a>
          )}
           {selectedDate === todayStr && (
             <span class="text-gray-400 px-3 py-1 border rounded-md cursor-not-allowed">Next Day ></span>
          )}
        </div>
         <div class="text-center mb-8">
            <a href="/stats" class="text-sm text-indigo-500 hover:underline">View Today's Stats</a>
        </div>


        {error && (
          <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <strong class="font-bold">Error: </strong>
            <span class="block sm:inline">{error}</span>
          </div>
        )}

        {!error && (
          <div class="overflow-x-auto bg-white shadow-md rounded-lg">
            <table class="min-w-full leading-normal">
              <thead>
                <tr>
                  <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Game Mode
                  </th>
                  <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Unique Users
                  </th>
                </tr>
              </thead>
              <tbody>
                {KNOWN_GAME_MODES.map((mode) => (
                  <tr key={mode}>
                    <td class="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                      <p class="text-gray-900 whitespace-no-wrap capitalize">{mode}</p>
                    </td>
                    <td class="px-5 py-4 border-b border-gray-200 bg-white text-sm text-right">
                      <p class="text-gray-900 whitespace-no-wrap">
                        {perGameCounts[mode] !== undefined ? perGameCounts[mode].toLocaleString() : "N/A"}
                      </p>
                    </td>
                  </tr>
                ))}
                <tr class="bg-gray-50">
                  <td class="px-5 py-4 border-b border-gray-200 text-sm font-semibold">
                    <p class="text-gray-900 whitespace-no-wrap">Total Unique Users (for {selectedDate})</p>
                  </td>
                  <td class="px-5 py-4 border-b border-gray-200 text-sm text-right font-semibold">
                    <p class="text-gray-900 whitespace-no-wrap">
                      {totalUniqueUsers.toLocaleString()}
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
         <p class="text-xs text-gray-500 mt-6 text-center">
            Note: "Unique Users" are based on anonymized, salted hashes of IP addresses, reset daily. This count reflects distinct visitors for the selected day.
          </p>
      </div>
    </Layout>
  );
}