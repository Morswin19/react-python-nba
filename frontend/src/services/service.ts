const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const fetchPlayerStats = async (playerName: string) => {
  const response = await fetch(`${API_BASE_URL}/player/${playerName}`);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch player data");
  }

  return response.json();
};
