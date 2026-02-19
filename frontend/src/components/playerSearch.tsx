import type { SearchResponseItem } from "../types/types";

interface SearchPlayerProps {
  query: string;
  setQuery: (val: string) => void;
  searchResults: SearchResponseItem[];
  onSearch: () => void;
  onSelect: (id: number) => void;
}

export function SearchPlayer({
  query,
  setQuery,
  searchResults,
  onSearch,
  onSelect,
}: SearchPlayerProps) {
  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex gap-2 mb-8 w-full justify-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. randle"
          className="border p-2 rounded w-full max-w-75"
        />
        <button
          className="bg-blue-900 text-white px-10 rounded-md transition-hover hover:bg-blue-800"
          onClick={onSearch}
        >
          Search
        </button>
      </div>

      {searchResults.length > 0 && (
        <div className="flex flex-wrap gap-2 w-full">
          {searchResults.map((player) => (
            <button
              key={player.id}
              onClick={() => onSelect(player.id)}
              className="p-3 border rounded hover:bg-gray-100 text-left grow max-w-75 transition-colors"
            >
              {player.full_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
