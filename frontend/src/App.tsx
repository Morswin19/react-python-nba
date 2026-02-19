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
  // --- State ---
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResponseItem[]>([]);
  const [playerData, setPlayerData] = useState<PlayerResponse | null>(null);
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);
  const [matrixData, setMatrixData] = useState<MatrixStore>({});

  // --- Derived State (Score & Validation) ---
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
      // Send to Flask
      const response = await fetch("http://localhost:5001/api/matrix", {
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
      alert("Server error! Could not save player.");
    }

    // setMatrixData((prev) => ({
    //   ...prev,
    //   [cellKey]: {
    //     playerName: playerData.player_name,
    //     points: playerData.career_totals.PTS,
    //     playerId: playerData.player_id,
    //   },
    // }));
  };

  const handleRemoveFromCell = (cellKey: string) => {
    setMatrixData((prev) => {
      // 1. Create a shallow copy of the existing data
      const newData = { ...prev };
      // 2. Remove the specific key
      delete newData[cellKey];
      // 3. Return the updated object to trigger a re-render
      return newData;
    });
  };

  useEffect(() => {
    const syncWithServer = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/matrix");
        const serverData = await response.json();
        setMatrixData(serverData);
      } catch (error) {
        console.error("Error syncing with server:", error);
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
          <TeamMatrix
            selectedCell={selectedCell}
            onCellClick={(row, col) => setSelectedCell({ row, col })}
            matrixData={matrixData}
            onRemovePlayer={handleRemoveFromCell}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
