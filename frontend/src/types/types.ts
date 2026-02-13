export interface SeasonStats {
  SEASON_ID: string;
  TEAM_ABBREVIATION: string;
  PTS: number;
  AST: number;
  REB: number;
}

export interface PlayerResponse {
  player_name: string;
  stats: SeasonStats[];
  career_totals: SeasonStats;
}

export interface SearchResponseItem {
  full_name: string;
  id: number;
}

export interface SelectedCell {
  row: string;
  col: string;
}

export interface CellData {
  playerName: string;
  points: number;
}

export type MatrixStore = Record<string, CellData>;
