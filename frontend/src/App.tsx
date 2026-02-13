import { useState } from "react";
import "./App.css";
import { fetchPlayerStats, searchPlayers } from "./services/service";
import { PlayerStatsTable } from "./components/playerStatsTable";
import type { PlayerResponse, SearchResponseItem } from "./types/types";
import { Header } from "./components/header";
import { SearchPlayer } from "./components/playerSearch";

function App() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResponseItem[]>([]);
  const [playerData, setPlayerData] = useState<PlayerResponse | null>(null);

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
        <Header />
        <SearchPlayer
          query={query}
          setQuery={setQuery}
          searchResults={searchResults}
          onSearch={handleInitialSearch}
          onSelect={handleSelectPlayer}
        />
        {playerData && <PlayerStatsTable playerData={playerData} />}
      </div>
    </div>
  );
}

export default App;
