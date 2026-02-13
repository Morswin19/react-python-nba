import { useState } from "react";
import "./App.css";
import { fetchPlayerStats, searchPlayers } from "./services/service";
import { PlayerStatsTable } from "./components/playerStatsTable";
import type {
  MatrixStore,
  PlayerResponse,
  SearchResponseItem,
  SelectedCell,
} from "./types/types";
import { Header } from "./components/header";
import { SearchPlayer } from "./components/playerSearch";
import { TeamMatrix } from "./components/teamMatrix";

function App() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResponseItem[]>([]);
  const [playerData, setPlayerData] = useState<PlayerResponse | null>(null);
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);
  const [matrixData, setMatrixData] = useState<MatrixStore>({});

  const handleInitialSearch = async () => {
    setPlayerData(null); // Clear old stats
    const results = await searchPlayers(query);
    setSearchResults(results);
  };

  console.log(matrixData);

  const handleAddToCell = () => {
    // If no cell is selected or no player data exists, do nothing
    if (!selectedCell || !playerData) return;

    const cellKey = `${selectedCell.row}-${selectedCell.col}`;

    setMatrixData((prev) => ({
      ...prev,
      [cellKey]: {
        playerName: playerData.player_name,
        points: playerData.career_totals.PTS,
      },
    }));
  };

  const handleSelectPlayer = async (id: number) => {
    setSearchResults([]); // Clear the list
    const data = await fetchPlayerStats(id);
    setPlayerData(data);
  };

  return (
    <div style={{ padding: "40px" }}>
      <div className="max-w-7xl w-[90%] m-auto flex flex-col items-center">
        <Header />
        <h2>
          {selectedCell &&
            `selected cell: ${selectedCell.row} - ${selectedCell.col}`}
        </h2>
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
          />
        )}
        <TeamMatrix
          selectedCell={selectedCell}
          onCellClick={(row, col) => setSelectedCell({ row, col })}
          matrixData={matrixData}
        />
      </div>
    </div>
  );
}

export default App;
