import os
from flask import Flask, jsonify
from flask_cors import CORS
from nba_api.stats.static import players
from nba_api.stats.endpoints import playercareerstats

app = Flask(__name__)
CORS(app)

# 1. ADD THIS: A simple home route to test the port
@app.route('/')
def home():
    return "NBA Matrix API is Online!"

@app.route('/api/matrix')
def get_matrix():
    # Your existing logic to return the matrix JSON file
    return jsonify({"message": "Matrix file logic here"})

@app.route('/api/search/<string:name>')
def search(name):
    search_results = players.find_players_by_full_name(name)
    return jsonify(search_results)

@app.route('/api/stats/<int:player_id>')
def get_stats(player_id):
    try:
        # Dictionary mode = no Pandas = no memory crash
        career = playercareerstats.PlayerCareerStats(player_id=player_id).get_dict()
        
        # Extract unique teams
        rows = career['resultSets'][0]['rowSet']
        headers = career['resultSets'][0]['headers']
        team_idx = headers.index('TEAM_ABBREVIATION')
        teams = list(set(row[team_idx] for row in rows))

        return jsonify({
            "player_id": player_id,
            "team_history": teams,
            "stats": [] # Keeps frontend from breaking
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(host='0.0.0.0', port=port)