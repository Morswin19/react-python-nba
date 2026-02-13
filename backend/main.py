from flask import Flask, jsonify
from flask_cors import CORS
from nba_api.stats.static import players
from nba_api.stats.endpoints import playercareerstats

app = Flask(__name__)
CORS(app)

@app.route('/api/player/<name>', methods=['GET'])
def get_player_stats(name):
    # 1. Find the player by name
    nba_players = players.find_players_by_full_name(name)
    if not nba_players:
        return jsonify({"error": "Player not found"}), 404
    
    player_id = nba_players[0]['id']
    
    career = playercareerstats.PlayerCareerStats(player_id=player_id)
    df = career.get_data_frames()[0]
    
    last_seasons = df.tail(5).to_dict(orient='records')
    
    return jsonify({
        "player_name": nba_players[0]['full_name'],
        "stats": last_seasons
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)