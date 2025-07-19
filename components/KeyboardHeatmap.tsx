import { HeatmapColorScheme, KeyboardHeatmapData } from "../types/userStats.ts";
import { QWERTY_LAYOUT } from "../utils/keyboardLayout.ts";

interface KeyboardHeatmapProps {
  heatmapData: KeyboardHeatmapData;
  colorScheme?: HeatmapColorScheme;
  showLabels?: boolean;
  onKeyClick?: (keyCode: string) => void;
  className?: string;
}

/**
 * Calculate color intensity for error-based heatmap
 */
function calculateErrorIntensity(
  errorCount: number,
  totalPresses: number,
): string {
  if (totalPresses === 0) return "bg-gray-100 hover:bg-gray-200";

  const errorRate = errorCount / totalPresses;
  if (errorRate === 0) return "bg-green-100 hover:bg-green-200";
  if (errorRate <= 0.05) return "bg-yellow-200 hover:bg-yellow-300";
  if (errorRate <= 0.1) return "bg-orange-300 hover:bg-orange-400";
  if (errorRate <= 0.2) return "bg-red-400 hover:bg-red-500";
  return "bg-red-600 hover:bg-red-700 text-white";
}

/**
 * Calculate color intensity for game errors with gradual red progression
 */
function calculateGameErrorIntensity(
  errorCount: number,
  heatmapData: KeyboardHeatmapData,
): string {
  if (errorCount === 0) return "bg-gray-100 hover:bg-gray-200";

  // Find the maximum error count for scaling
  const allErrorCounts = Object.values(heatmapData).map((k) => k.errorCount)
    .filter((c) => c > 0);
  const maxErrors = allErrorCounts.length > 0 ? Math.max(...allErrorCounts) : 1;

  // Calculate intensity based on error count relative to max errors
  const intensity = Math.min(errorCount / maxErrors, 1);

  if (intensity <= 0.2) return "bg-red-100 hover:bg-red-200";
  if (intensity <= 0.4) return "bg-red-200 hover:bg-red-300";
  if (intensity <= 0.6) return "bg-red-300 hover:bg-red-400";
  if (intensity <= 0.8) return "bg-red-400 hover:bg-red-500 text-white";
  return "bg-red-600 hover:bg-red-700 text-white";
}

/**
 * Calculate color intensity for speed-based heatmap
 */
function calculateSpeedIntensity(averageSpeed: number): string {
  if (averageSpeed === 0) return "bg-gray-100 hover:bg-gray-200";

  // Faster typing = better (lower ms values)
  if (averageSpeed <= 100) return "bg-green-600 hover:bg-green-700 text-white";
  if (averageSpeed <= 200) return "bg-green-400 hover:bg-green-500";
  if (averageSpeed <= 350) return "bg-yellow-300 hover:bg-yellow-400";
  if (averageSpeed <= 500) return "bg-orange-400 hover:bg-orange-500";
  return "bg-red-500 hover:bg-red-600 text-white";
}

/**
 * Calculate color intensity for accuracy-based heatmap
 */
function calculateAccuracyIntensity(
  errorCount: number,
  totalPresses: number,
): string {
  if (totalPresses === 0) return "bg-gray-100 hover:bg-gray-200";

  const accuracy = ((totalPresses - errorCount) / totalPresses) * 100;
  if (accuracy >= 98) return "bg-green-600 hover:bg-green-700 text-white";
  if (accuracy >= 95) return "bg-green-400 hover:bg-green-500";
  if (accuracy >= 90) return "bg-yellow-300 hover:bg-yellow-400";
  if (accuracy >= 80) return "bg-orange-400 hover:bg-orange-500";
  return "bg-red-500 hover:bg-red-600 text-white";
}

/**
 * Get the appropriate color class for a key based on the color scheme
 */
function getKeyColor(
  keyData: KeyboardHeatmapData[string] | undefined,
  colorScheme: HeatmapColorScheme,
  allHeatmapData?: KeyboardHeatmapData,
): string {
  if (!keyData) return "bg-gray-100 hover:bg-gray-200";

  switch (colorScheme) {
    case "errors":
      return calculateErrorIntensity(keyData.errorCount, keyData.totalPresses);
    case "speed":
      return calculateSpeedIntensity(keyData.averageSpeed);
    case "accuracy":
      return calculateAccuracyIntensity(
        keyData.errorCount,
        keyData.totalPresses,
      );
    case "game-errors":
      return calculateGameErrorIntensity(
        keyData.errorCount,
        allHeatmapData || {},
      );
    default:
      return "bg-gray-100 hover:bg-gray-200";
  }
}

/**
 * Get the width class for a key based on its relative width
 */
function getKeyWidthClass(width: number): string {
  if (width <= 1) return "w-10 h-10";
  if (width <= 1.5) return "w-14 h-10";
  if (width <= 2) return "w-18 h-10";
  if (width <= 2.5) return "w-20 h-10";
  if (width <= 3) return "w-24 h-10";
  if (width <= 6) return "w-40 h-10";
  return "w-48 h-10";
}

/**
 * Generate tooltip text for a key
 */
function getKeyTooltip(
  keyCode: string,
  keyData: KeyboardHeatmapData[string] | undefined,
  _colorScheme: HeatmapColorScheme,
): string {
  if (!keyData) return `${keyCode}: No data`;

  const accuracy = keyData.totalPresses > 0
    ? ((keyData.totalPresses - keyData.errorCount) / keyData.totalPresses * 100)
      .toFixed(1)
    : "0";

  const speedText = keyData.averageSpeed > 0
    ? `${keyData.averageSpeed.toFixed(0)}ms`
    : "N/A";

  return `${keyData.keyLabel}
Total: ${keyData.totalPresses}
Errors: ${keyData.errorCount}
Accuracy: ${accuracy}%
Avg Speed: ${speedText}`;
}

export default function KeyboardHeatmap({
  heatmapData,
  colorScheme = "errors",
  showLabels = true,
  onKeyClick,
  className = "",
}: KeyboardHeatmapProps) {
  return (
    <div className={`keyboard-heatmap select-none ${className}`}>
      <div className="inline-block border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
        {QWERTY_LAYOUT.rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1 mb-1 justify-center">
            {row.keys.map((key) => {
              const keyData = heatmapData[key.keyCode];
              const colorClass = getKeyColor(keyData, colorScheme, heatmapData);
              const widthClass = getKeyWidthClass(key.width);

              return (
                <button
                  type="button"
                  key={key.keyCode}
                  className={`
                    keyboard-key
                    ${colorClass}
                    ${widthClass}
                    border border-gray-300 rounded
                    text-xs font-medium
                    transition-colors duration-200
                    flex items-center justify-center
                    ${onKeyClick ? "cursor-pointer" : "cursor-default"}
                  `}
                  onClick={() => onKeyClick?.(key.keyCode)}
                  title={getKeyTooltip(key.keyCode, keyData, colorScheme)}
                >
                  {showLabels && (
                    <span className="px-1 text-center leading-tight">
                      {colorScheme === "game-errors" && keyData?.keyLabel
                        ? keyData.keyLabel.split("\n").map((line, i) => (
                          <div key={i} className="text-xs">{line}</div>
                        ))
                        : (
                          <div>
                            {key.label.length > 8
                              ? key.label.substring(0, 6) + "..."
                              : key.label}
                          </div>
                        )}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <span className="font-medium">Legend:</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded">
            </div>
            <span>No data</span>
          </div>
          {colorScheme === "errors" && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border border-gray-300 rounded">
                </div>
                <span>No errors</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-200 border border-gray-300 rounded">
                </div>
                <span>Low errors</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-600 border border-gray-300 rounded">
                </div>
                <span>High errors</span>
              </div>
            </>
          )}
          {colorScheme === "speed" && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-600 border border-gray-300 rounded">
                </div>
                <span>Fast</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-300 border border-gray-300 rounded">
                </div>
                <span>Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 border border-gray-300 rounded">
                </div>
                <span>Slow</span>
              </div>
            </>
          )}
          {colorScheme === "accuracy" && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-600 border border-gray-300 rounded">
                </div>
                <span>High accuracy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-300 border border-gray-300 rounded">
                </div>
                <span>Medium accuracy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 border border-gray-300 rounded">
                </div>
                <span>Low accuracy</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
