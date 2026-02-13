import type { PlayerResponse } from "../types/types";

export const PlayerStatsTable = ({
  playerData,
  onAddToCell,
  usedInCell,
}: {
  playerData: PlayerResponse;
  onAddToCell: () => void;
  usedInCell: string;
}) => {
  console.log(playerData);

  return (
    <div
      className="w-full max-w-200"
      style={{ marginTop: "30px", animation: "fadeIn 0.5s" }}
    >
      <h2>{playerData.player_name}</h2>
      <button
        onClick={onAddToCell}
        className="mb-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
      >
        {usedInCell
          ? `Player used in ${usedInCell} cell`
          : `Add ${playerData.player_name} to selected cell`}
      </button>{" "}
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
            <tr key={index} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-1 text-gray-700">{season.SEASON_ID}</td>
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
  );
};
