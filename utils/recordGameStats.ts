interface GameStatsPayload {
  gameType: string;
  category?: string;
  isFinished: boolean;
}

export async function recordGameStats(
  payload: GameStatsPayload,
): Promise<void> {
  try {
    const response = await fetch("/api/game-stats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(
        "Failed to record game stats:",
        response.status,
        response.statusText,
      );
      // Optionally, parse and log the error response body
      const errorData = await response.json();
      console.error("Error details:", errorData);
    } else {
      const data = await response.json();
      console.log("Game stats recorded successfully:", data);
    }
  } catch (error) {
    console.error("Error sending game stats:", error);
  }
}
