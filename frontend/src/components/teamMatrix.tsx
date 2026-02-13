// src/components/TeamMatrix.tsx

import { NBA_TEAMS } from "../consts";

export function TeamMatrix() {
  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="overflow-auto border border-gray-300 rounded-lg shadow-sm max-h-[700px]">
        <table className="border-collapse bg-white text-sm">
          <thead>
            <tr>
              {/* Top-left corner cell is empty and sticky */}
              <th className="sticky top-0 left-0 z-30 bg-gray-100 border-b-2 border-r-2 border-gray-300 p-2 min-w-[60px]">
                TEAM
              </th>
              {/* Horizontal Header (Columns) */}
              {NBA_TEAMS.map((team) => (
                <th
                  key={`col-${team}`}
                  className="sticky top-0 z-20 bg-gray-50 border-b-2 border-r border-gray-300 p-2 font-bold text-blue-900 min-w-[60px]"
                >
                  {team}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {NBA_TEAMS.map((rowTeam) => (
              <tr key={`row-${rowTeam}`}>
                {/* Vertical Header (Sticky Column) */}
                <td className="sticky left-0 z-20 bg-gray-50 border-r-2 border-b border-gray-300 p-2 font-bold text-blue-900 text-center">
                  {rowTeam}
                </td>

                {/* Empty Data Cells */}
                {NBA_TEAMS.map((colTeam) => {
                  const isDiagonal = rowTeam === colTeam;
                  return (
                    <td
                      key={`${rowTeam}-${colTeam}`}
                      className={`border-r border-b border-gray-200 p-2 min-w-25 h-8 text-center
                        ${isDiagonal ? "bg-gray-200" : "hover:bg-blue-50 transition-colors"}`}
                    >
                      {/* Placeholder for future data */}
                      {!isDiagonal && (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
