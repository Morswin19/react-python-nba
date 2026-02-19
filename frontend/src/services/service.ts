const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const fetchPlayerStats = async (id: number) => {
  const response = await fetch(`${API_BASE_URL}/stats/${id}`);
  if (!response.ok) throw new Error("Could not load stats");
  return response.json();
};

export const searchPlayers = async (name: string) => {
  const response = await fetch(`${API_BASE_URL}/search/${name}`);
  if (!response.ok) throw new Error("Search failed");
  return response.json();
};
