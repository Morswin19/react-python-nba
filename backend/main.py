from flask import Flask, jsonify
from flask_cors import CORS
from nba_api.stats.static import players
from nba_api.stats.endpoints import playercareerstats

app = Flask(__name__)
CORS(app)

@app.route('/api/search/<name>', methods=['GET'])
def search_players(name):
    # This only returns a list of names and IDs
    all_matches = players.find_players_by_full_name(name)
    results = []
    for p in all_matches:
        results.append({
            "id": p['id'],
            "full_name": p['full_name']
        })
    return jsonify(results)

@app.route('/api/stats/<int:player_id>', methods=['GET'])
def get_player_stats_by_id(player_id):
    career = playercareerstats.PlayerCareerStats(player_id=player_id)
    
    # 1. Get the DataFrames
    df_seasons = career.get_data_frames()[0]
    df_totals = career.get_data_frames()[1]
    
    # 2. IMPORTANT: Replace NaN with 0 (or None)
    # .fillna(0) turns NaN into 0, which is valid JSON
    df_seasons = df_seasons.fillna(0)
    df_totals = df_totals.fillna(0)
    
    player_info = players.find_player_by_id(player_id)
    
    return jsonify({
        "player_id": player_id,
        "player_name": player_info['full_name'],
        "stats": df_seasons.to_dict(orient='records'),
        "career_totals": df_totals.to_dict(orient='records')[0]
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)