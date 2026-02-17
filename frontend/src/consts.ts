export const NBA_TEAMS = [
  "ATL",
  "BOS",
  "BKN",
  "CHA",
  "CHI",
  "CLE",
  "DAL",
  "DEN",
  "DET",
  "GSW",
  "HOU",
  "IND",
  "LAC",
  "LAL",
  "MEM",
  "MIA",
  "MIL",
  "MIN",
  "NOP",
  "NYK",
  "OKC",
  "ORL",
  "PHI",
  "PHX",
  "POR",
  "SAC",
  "SAS",
  "TOR",
  "UTA",
  "WAS",
];

export const TEAM_HISTORY: Record<string, string[]> = {
  // PACIFIC DIVISION
  GSW: ["GSW", "SFW", "PHW", "GOS"], // Golden State, San Francisco, Philadelphia Warriors
  LAL: ["LAL", "MNL"], // LA, Minneapolis Lakers
  LAC: ["LAC", "SDC", "BUF"], // LA Clippers, San Diego Clippers, Buffalo Braves
  PHX: ["PHX"], // Phoenix Suns
  SAC: ["SAC", "KCK", "KCO", "CIN", "ROC"], // Kings, KC, Cincinnati, Rochester

  // NORTHWEST DIVISION
  DEN: ["DEN", "DNA", "DNR"], // Denver Nuggets (including ABA years if in data)
  MIN: ["MIN"], // Minnesota Timberwolves
  OKC: ["OKC", "SEA"], // Oklahoma City Thunder, Seattle SuperSonics
  POR: ["POR"], // Portland Trail Blazers
  UTA: ["UTA", "NOJ"], // Utah, New Orleans Jazz

  // SOUTHWEST DIVISION
  DAL: ["DAL"], // Dallas Mavericks
  HOU: ["HOU", "SDR"], // Houston, San Diego Rockets
  MEM: ["MEM", "VAN"], // Memphis, Vancouver Grizzlies
  NOP: ["NOP", "NOH", "NOK"], // Pelicans, NO Hornets, NO/OKC Hornets, Original Charlotte Hornets
  SAS: ["SAS", "DLC", "TEX"], // Spurs, Dallas Chaparrals, Texas Chaparrals

  // ATLANTIC DIVISION
  BOS: ["BOS"], // Boston Celtics
  BKN: ["BKN", "NJN", "NYN", "NYA"], // Brooklyn, New Jersey, NY Nets, NY Americans
  NYK: ["NYK"], // New York Knicks
  PHI: ["PHI", "SYR"], // Philadelphia 76ers, Syracuse Nationals
  TOR: ["TOR"], // Toronto Raptors

  // CENTRAL DIVISION
  CHI: ["CHI"], // Chicago Bulls
  CLE: ["CLE"], // Cleveland Cavaliers
  DET: ["DET", "FTW"], // Detroit, Fort Wayne Pistons
  IND: ["IND", "INA"], // Indiana Pacers
  MIL: ["MIL"], // Milwaukee Bucks

  // SOUTHEAST DIVISION
  ATL: ["ATL", "STL", "TRI", "MLH"], // Atlanta, St. Louis, Tri-Cities, Milwaukee Hawks
  CHA: ["CHA", "CHB", "CHH"], // Charlotte Hornets (Bobcats years often coded as CHA/CHB)
  MIA: ["MIA"], // Miami Heat
  ORL: ["ORL"], // Orlando Magic
  WAS: ["WAS", "WSB", "CAP", "BAL", "CHZ", "CHP"], // Wizards, Bullets, Capital, Baltimore, Zephyrs, Packers
};
