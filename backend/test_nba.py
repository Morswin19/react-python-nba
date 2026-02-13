from nba_api.stats.static import players
from nba_api.stats.endpoints import playercareerstats

# 1. Search for a player
find = players.find_players_by_full_name("LeBron James")
lebron = find[0]
print(f"Found: {lebron['full_name']} (ID: {lebron['id']})")

# 2. Get stats
career = playercareerstats.PlayerCareerStats(player_id=lebron['id'])
df = career.get_data_frames()[0]

# 3. Print the last few seasons to the terminal
print("\nRecent Stats:")
print(df[['SEASON_ID', 'TEAM_ABBREVIATION', 'PTS', 'AST']].tail())