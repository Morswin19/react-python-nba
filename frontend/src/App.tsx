import { useState } from "react";
import "./App.css";
import { fetchPlayerStats, searchPlayers } from "./services/service";

function App() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [playerData, setPlayerData] = useState<any>(null);

  const handleInitialSearch = async () => {
    setPlayerData(null); // Clear old stats
    const results = await searchPlayers(query);
    setSearchResults(results);
  };

  const handleSelectPlayer = async (id: number) => {
    setSearchResults([]); // Clear the list
    const data = await fetchPlayerStats(id);
    setPlayerData(data);
  };

  return (
    <div style={{ padding: "40px" }}>
      <div className="max-w-7xl w-[90%] m-auto flex flex-col items-center">
        <h1 className="text-4xl">
          NBA Stats Finder <span>🏀</span>
        </h1>
        <div className="flex gap-2 mb-8">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. randle"
            className="border p-2 rounded w-full max-w-75"
          />

          <button
            className="bg-blue-900 text-white px-10 rounded-md"
            onClick={handleInitialSearch}
          >
            Search
          </button>
        </div>
        {searchResults.length > 0 && (
          <div className="grid grid-cols-1 gap-2 mb-8">
            {searchResults.map((player) => (
              <button
                key={player.id}
                onClick={() => handleSelectPlayer(player.id)}
                className="p-3 border rounded hover:bg-gray-100 text-left"
              >
                {player.full_name}
              </button>
            ))}
          </div>
        )}
        {playerData && (
          <div
            className="w-full max-w-200"
            style={{ marginTop: "30px", animation: "fadeIn 0.5s" }}
          >
            <h2>{playerData.player_name}</h2>
            <p>Found {playerData.stats.length} seasons of data.</p>
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
                {playerData.stats.map((season, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors"
                  >
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
              {playerData.career_totals && (
                <tfoot className="text-sm bg-gray-100 font-bold border-t-2 border-blue-900">
                  <tr>
                    <td className="px-6 py-1">CAREER</td>
                    <td className="px-6 py-1">ALL</td>
                    <td className="px-6 py-1 text-right text-blue-900">
                      {playerData.career_totals.PTS}
                    </td>
                    <td className="px-6 py-1 text-right text-blue-900">
                      {playerData.career_totals.REB}
                    </td>
                    <td className="px-6 py-1 text-right text-blue-900">
                      {playerData.career_totals.AST}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
