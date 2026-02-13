import { NBA_TEAMS } from "../consts";
import type { MatrixStore } from "../types/types";

interface TeamMatrixProps {
  selectedCell: { row: string; col: string } | null;
  onCellClick: (row: string, col: string) => void;
  matrixData: MatrixStore;
}

export function TeamMatrix({
  selectedCell,
  onCellClick,
  matrixData,
}: TeamMatrixProps) {
  return (
    <>
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
                <tr key={rowTeam}>
                  <td className="sticky left-0 z-20 bg-gray-50 border-r-2 border-b border-gray-300 p-2 font-bold text-center">
                    {rowTeam}
                  </td>
                  {NBA_TEAMS.map((colTeam) => {
                    const isDiagonal = rowTeam === colTeam;
                    const isActive =
                      selectedCell?.row === rowTeam &&
                      selectedCell?.col === colTeam;
                    const cellKey = `${rowTeam}-${colTeam}`;
                    const cellContent = matrixData[cellKey];

                    return (
                      <td
                        key={`${rowTeam}-${colTeam}`}
                        // Removed "!isDiagonal" check to allow clicking everywhere
                        onClick={() => onCellClick(rowTeam, colTeam)}
                        className={`border-r border-b border-gray-200 p-2 min-w-25 h-8 text-center cursor-pointer transition-all
        ${isDiagonal ? "bg-gray-100" : ""} 
        ${isActive ? "bg-yellow-400 ring-4 ring-inset ring-blue-600 font-bold z-10" : "hover:bg-blue-50"}
      `}
                      >
                        {/* Show different placeholder if it's the diagonal vs empty data */}
                        {cellContent ? (
                          <div className="flex flex-col animate-in fade-in zoom-in duration-300">
                            <span className="font-bold text-blue-900 leading-tight">
                              {cellContent.playerName}
                            </span>
                            <span className="text-gray-500">
                              {cellContent.points} PTS
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-300">
                            {isActive ? "🎯" : "—"}
                          </span>
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
    </>
  );
}
