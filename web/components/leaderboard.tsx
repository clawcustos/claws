"use client";

// Mock data
const leaderboardData = [
  { rank: 1, xHandle: "truth_terminal", value: 44.1 },
  { rank: 2, xHandle: "aixbt_agent", value: 6.5 },
  { rank: 3, xHandle: "luna_virtuals", value: 2.0 },
  { rank: 4, xHandle: "zerebro", value: 0.8 },
  { rank: 5, xHandle: "kellyclaudeai", value: 0.5 },
];

export function Leaderboard() {
  return (
    <div className="bg-[#161B22] border border-gray-800 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-800">
        <h3 className="font-semibold text-white">Top by Market Cap</h3>
      </div>
      <div className="divide-y divide-gray-800">
        {leaderboardData.map((item) => (
          <div
            key={item.rank}
            className="flex items-center justify-between p-4 hover:bg-[#1C2128] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="text-gray-500 font-mono w-6">{item.rank}</span>
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-full" />
              <span className="text-white font-medium">@{item.xHandle}</span>
            </div>
            <span className="text-gray-400">{item.value.toFixed(1)} ETH</span>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-gray-800">
        <button className="w-full py-2 text-center text-gray-400 hover:text-white transition-colors">
          View All →
        </button>
      </div>
    </div>
  );
}
