import { useEffect, useState } from "preact/hooks";
import {
  HeatmapColorScheme,
  KeyboardHeatmapData,
  KeyboardKeyData,
} from "../types/userStats.ts";
import { UserStatsManager } from "../utils/userStatsManager.ts";
import KeyboardHeatmap from "../components/KeyboardHeatmap.tsx";

interface KeyDetailsModalProps {
  keyCode: string;
  keyData: KeyboardKeyData;
  onClose: () => void;
}

function KeyDetailsModal(
  { keyCode: _keyCode, keyData, onClose }: KeyDetailsModalProps,
) {
  const accuracy = keyData.totalPresses > 0
    ? ((keyData.totalPresses - keyData.errorCount) / keyData.totalPresses * 100)
      .toFixed(1)
    : "0";

  const errorRate = keyData.totalPresses > 0
    ? (keyData.errorCount / keyData.totalPresses * 100).toFixed(1)
    : "0";

  const speedText = keyData.averageSpeed > 0
    ? `${keyData.averageSpeed.toFixed(0)}ms`
    : "N/A";

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            Key Details: {keyData.keyLabel}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Total Presses:</span>
            <span className="font-medium">{keyData.totalPresses}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Errors:</span>
            <span className="font-medium text-red-600">
              {keyData.errorCount}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Accuracy:</span>
            <span className="font-medium text-green-600">{accuracy}%</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Error Rate:</span>
            <span className="font-medium text-orange-600">{errorRate}%</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Average Speed:</span>
            <span className="font-medium">{speedText}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Position:</span>
            <span className="font-medium">
              Row {keyData.position.row + 1}, Col {keyData.position.col + 1}
            </span>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function KeyboardHeatmapIsland() {
  const [heatmapData, setHeatmapData] = useState<KeyboardHeatmapData>({});
  const [colorScheme, setColorScheme] = useState<HeatmapColorScheme>("errors");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLabels, setShowLabels] = useState(true);

  useEffect(() => {
    const loadHeatmapData = async () => {
      try {
        const userStatsManager = UserStatsManager.getInstance();
        await userStatsManager.initialize();
        const data = userStatsManager.getKeyboardHeatmapData();
        setHeatmapData(data);
      } catch (error) {
        console.error("Failed to load heatmap data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadHeatmapData();
  }, []);

  const handleKeyClick = (keyCode: string) => {
    if (heatmapData[keyCode]) {
      setSelectedKey(keyCode);
    }
  };

  const handleCloseModal = () => {
    setSelectedKey(null);
  };

  const totalKeys = Object.keys(heatmapData).length;
  const keysWithData =
    Object.values(heatmapData).filter((key) => key.totalPresses > 0).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500">
        </div>
        <span className="ml-2 text-gray-600">Loading keyboard heatmap...</span>
      </div>
    );
  }

  return (
    <div className="keyboard-heatmap-container">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        {/* Color scheme selector */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-700 flex items-center">
            View:
          </span>
          <button
            type="button"
            onClick={() => setColorScheme("errors")}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              colorScheme === "errors"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Errors
          </button>
          <button
            type="button"
            onClick={() => setColorScheme("speed")}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              colorScheme === "speed"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Speed
          </button>
          <button
            type="button"
            onClick={() => setColorScheme("accuracy")}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              colorScheme === "accuracy"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Accuracy
          </button>
        </div>

        {/* Labels toggle */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={showLabels}
              onChange={(e) =>
                setShowLabels((e.target as HTMLInputElement).checked)}
              className="rounded"
            />
            Show Labels
          </label>
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-gray-600">Total Keys</div>
          <div className="font-semibold">{totalKeys}</div>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-gray-600">Keys with Data</div>
          <div className="font-semibold">{keysWithData}</div>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-gray-600">Coverage</div>
          <div className="font-semibold">
            {totalKeys > 0 ? Math.round((keysWithData / totalKeys) * 100) : 0}%
          </div>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-gray-600">Current View</div>
          <div className="font-semibold capitalize">{colorScheme}</div>
        </div>
      </div>

      {/* Heatmap component */}
      <div className="flex justify-center">
        <KeyboardHeatmap
          heatmapData={heatmapData}
          colorScheme={colorScheme}
          showLabels={showLabels}
          onKeyClick={handleKeyClick}
        />
      </div>

      {/* Usage instructions */}
      <div className="mt-6 text-sm text-gray-600 text-center">
        <p>
          Click on any key to see detailed statistics. Colors indicate
          performance based on the selected view.
        </p>
        {keysWithData === 0 && (
          <p className="mt-2 text-orange-600">
            No typing data available yet. Complete some typing exercises to see
            your keyboard heatmap!
          </p>
        )}
      </div>

      {/* Key details modal */}
      {selectedKey && heatmapData[selectedKey] && (
        <KeyDetailsModal
          keyCode={selectedKey}
          keyData={heatmapData[selectedKey]}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
