import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

interface SeasonStats {
  SEASON_ID: string;
  TEAM_ABBREVIATION: string;
  PTS: number;
  AST: number;
  REB: number;
}

interface PlayerResponse {
  player_name: string;
  stats: SeasonStats[];
}

function App() {
  const [playerName, setPlayerName] = useState<string>('')
  const [data, setData] = useState<PlayerResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const getNBAData = async () => {
    if (!playerName) return;
    
    setLoading(true);
    try {
      // Remember: python is on port 5000
      const response = await fetch(`http://127.0.0.1:5000/api/player/${playerName}`);
      
      if (!response.ok) {
        throw new Error("Player not found");
      }

      const result: PlayerResponse = await response.json();
      setData(result);
    } catch (error) {
      console.error("Fetch error:", error);
      alert("Make sure your Python server is running!");
    } finally {
      setLoading(false);
    }
  }

return (
    <div style={{ padding: '40px' }}>
      <h1>NBA Stats Finder 🏀</h1>
      
      <input 
        type="text" 
        value={playerName} 
        onChange={(e) => setPlayerName(e.target.value)}
        placeholder="e.g. LeBron James"
      />
      
      <button onClick={getNBAData} disabled={loading}>
        {loading ? 'Searching...' : 'Search'}
      </button>

      {data && (
        <div style={{ marginTop: '20px' }}>
          <h2>{data.player_name}</h2>
          <p>Found {data.stats.length} seasons of data.</p>
          {/* We will build a nice table here next! */}
        </div>
      )}
    </div>
  )
}

export default App
