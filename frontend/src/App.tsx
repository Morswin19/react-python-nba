import { useState } from "react";
import "./App.css";
import type { PlayerResponse } from "./types/types";
import { fetchPlayerStats } from "./services/service";

function App() {
  const [playerName, setPlayerName] = useState<string>("");
  const [data, setData] = useState<PlayerResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchPlayerStats(playerName);
      setData(data);
    } catch (err: any) {
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>
        NBA Stats Finder <span>🏀</span>
      </h1>

      <input
        type="text"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        placeholder="e.g. LeBron James"
      />

      <button onClick={handleSearch} disabled={loading}>
        {loading ? "Searching..." : "Search"}
      </button>
      {data && (
        <div style={{ marginTop: "30px", animation: "fadeIn 0.5s" }}>
          <h2>{data.player_name}</h2>
          <p>Found {data.stats.length} seasons of data.</p>
          <table className="w-full text-left border-collapse bg-white">
            <thead className="text-sm bg-blue-900 text-white">
              <tr>
                <th className="px-6 py-1 font-medium">Season</th>
                <th className="px-6 py-1 font-medium">Team</th>
                <th className="px-6 py-1 font-medium text-right">PTS</th>
                <th className="px-6 py-1 font-medium text-right">REB</th>
                <th className="px-6 py-1 font-medium text-right">AST</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100 border-t border-gray-100">
              {data.stats.map((season, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-1 text-gray-700">
                    {season.SEASON_ID}
                  </td>
                  <td className="px-6 py-1 text-gray-700">
                    {season.TEAM_ABBREVIATION}
                  </td>
                  <td className="px-6 py-1 text-gray-900 font-semibold text-right">
                    {season.PTS}
                  </td>
                  <td className="px-6 py-1 text-gray-700 text-right">
                    {season.REB}
                  </td>
                  <td className="px-6 py-1 text-gray-700 text-right">
                    {season.AST}
                  </td>
                </tr>
              ))}
            </tbody>
            {data.career_totals && (
              <tfoot className="text-sm bg-gray-100 font-bold border-t-2 border-blue-900">
                <tr>
                  <td className="px-6 py-1">CAREER</td>
                  <td className="px-6 py-1">ALL</td>
                  <td className="px-6 py-1 text-right text-blue-900">
                    {data.career_totals.PTS}
                  </td>
                  <td className="px-6 py-1 text-right text-blue-900">
                    {data.career_totals.REB}
                  </td>
                  <td className="px-6 py-1 text-right text-blue-900">
                    {data.career_totals.AST}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
