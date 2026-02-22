import { useState, useMemo, useEffect } from "react";
import "./App.css";
import { fetchPlayerStats, searchPlayers } from "./services/service";
import { PlayerStatsTable } from "./components/playerStatsTable";
import { Header } from "./components/header";
import { SearchPlayer } from "./components/playerSearch";
import { TeamMatrix } from "./components/teamMatrix";
import type {
  MatrixStore,
  PlayerResponse,
  SearchResponseItem,
  SelectedCell,
} from "./types/types";
import { TEAM_HISTORY } from "./consts";

function App() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResponseItem[]>([]);
  const [playerData, setPlayerData] = useState<PlayerResponse | null>(null);
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);
  const [matrixData, setMatrixData] = useState<MatrixStore>({});
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("Waking up the server...");

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

  const totalScore = useMemo(() => {
    return Object.values(matrixData).reduce(
      (sum, cell) => sum + cell.points,
      0,
    );
  }, [matrixData]);

  const usedInCell = useMemo(() => {
    if (!playerData) return undefined;
    return Object.keys(matrixData).find(
      (key) => matrixData[key].playerId === playerData.player_id,
    );
  }, [matrixData, playerData]);

  // This function calculates if the current player is allowed in the selected cell
  const getEligibilityError = () => {
    if (!selectedCell || !playerData) return null;
    const { row, col } = selectedCell;

    // Get unique list of team abbreviations from player's career
    const playerTeams = Array.from(
      new Set(playerData.stats.map((s) => s.TEAM_ABBREVIATION)),
    );

    const playedForFranchise = (franchiseKey: string) => {
      const historicalAbbrs = TEAM_HISTORY[franchiseKey] || [franchiseKey];
      return playerTeams.some((team) => historicalAbbrs.includes(team));
    };

    // Rule 1: Diagonal (Loyalty check)
    if (row === col) {
      const historicalAbbrs = TEAM_HISTORY[row] || [row];
      const isLoyal = playerTeams.every((team) =>
        historicalAbbrs.includes(team),
      );
      return isLoyal ? null : `Must have played ONLY for the ${row} franchise`;
    }

    // Rule 2: Matchup (Connection check)
    const hasRow = playedForFranchise(row);
    const hasCol = playedForFranchise(col);

    if (!hasRow && !hasCol) return `Never played for ${row} or ${col}`;
    if (!hasRow) return `Never played for ${row}`;
    if (!hasCol) return `Never played for ${col}`;

    return null;
  };

  const eligibilityError = getEligibilityError();

  // --- Handlers ---
  const handleInitialSearch = async () => {
    if (!query) return;
    setPlayerData(null);
    const results = await searchPlayers(query);
    setSearchResults(results);
  };

  const handleSelectPlayer = async (id: number) => {
    setSearchResults([]);
    const data = await fetchPlayerStats(id);
    setPlayerData(data);
  };

  const handleAddToCell = async () => {
    if (!selectedCell || !playerData) {
      alert("Please select a cell in the matrix first!");
      return;
    }

    if (eligibilityError) {
      alert(eligibilityError);
      return;
    }

    if (usedInCell) {
      alert(`${playerData.player_name} is already used in cell: ${usedInCell}`);
      return;
    }

    const cellKey = `${selectedCell.row}-${selectedCell.col}`;

    const newEntry = {
      [cellKey]: {
        playerName: playerData.player_name,
        points: playerData.career_totals.PTS,
        playerId: playerData.player_id,
      },
    };

    try {
      const response = await fetch(`${API_BASE_URL}/matrix`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEntry),
      });

      if (response.ok) {
        // Only update local UI if the server saved it successfully
        setMatrixData((prev) => ({ ...prev, ...newEntry }));
      }
    } catch (error) {
      console.log(error);
      alert("Server error! Could not save player.");
    }
  };

  const handleRemoveFromCell = (cellKey: string) => {
    setMatrixData((prev) => {
      const newData = { ...prev };
      delete newData[cellKey];
      return newData;
    });
  };

  useEffect(() => {
    const syncWithServer = async () => {
      try {
        setIsLoading(true);
        setStatusMessage("waiting for matrix data");
        const response = await fetch(`${API_BASE_URL}/matrix`);
        const serverData = await response.json();
        setMatrixData(serverData);
      } catch (error) {
        console.error("Error syncing with server:", error);
        setStatusMessage("Error loading data. Is the backend online?");
      } finally {
        setIsLoading(false);
      }
    };
    syncWithServer();
  }, []);

  return (
    <div style={{ padding: "40px" }}>
      <div className="max-w-7xl w-[90%] m-auto flex flex-col items-center">
        <Header totalScore={totalScore} />

        <div className="mb-4 h-8 text-blue-900 font-semibold italic">
          {selectedCell
            ? `Selected Matchup: ${selectedCell.row} vs ${selectedCell.col}`
            : "Click a cell in the matrix below to start"}
        </div>

        <SearchPlayer
          query={query}
          setQuery={setQuery}
          searchResults={searchResults}
          onSearch={handleInitialSearch}
          onSelect={handleSelectPlayer}
        />

        {playerData && (
          <PlayerStatsTable
            playerData={playerData}
            onAddToCell={handleAddToCell}
            usedInCell={usedInCell}
            eligibilityError={eligibilityError}
          />
        )}

        <div className="mt-10 w-full">
          {isLoading ? (
            <div className="grid place-items-center h-20">
              <div>
                <span className="text-4xl inline-block animate-spin">🏀</span>
              </div>
              <p>{statusMessage}</p>
            </div>
          ) : (
            <TeamMatrix
              selectedCell={selectedCell}
              onCellClick={(row, col) => setSelectedCell({ row, col })}
              matrixData={matrixData}
              onRemovePlayer={handleRemoveFromCell}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
