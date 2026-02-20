import json
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from nba_api.stats.static import players
from nba_api.stats.endpoints import playercareerstats

# 2. Load the variables from .env
load_dotenv()

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": [os.getenv("ALLOWED_ORIGIN", "http://localhost:5173")],        
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})
DATA_FILE = os.getenv("DATA_FILE", "matrix_state.json")

def load_data():
    """Helper to read the JSON file safely."""
    if not os.path.exists(DATA_FILE):
        return {} # Return empty if file doesn't exist yet
    with open(DATA_FILE, "r") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return {}
        
def save_data(data):
    """Helper to write the dictionary to the JSON file."""
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=4)

@app.route('/api/matrix', methods=['GET'])
def get_matrix():
    data = load_data()
    return jsonify(data)

@app.route('/api/matrix', methods=['POST'])
def update_matrix():
    # 1. Load current file state
    current_state = load_data()
    
    # 2. Get the new player entry from React
    new_entry = request.json # Expecting { "LAL-BOS": { ... } }
    
    # 3. Merge and Save
    current_state.update(new_entry)
    save_data(current_state)
    
    return jsonify({"status": "success", "data": current_state})

# Add a Reset route for the "Clear Board" button
@app.route('/api/matrix/reset', methods=['POST'])
def reset_matrix():
    save_data({})
    return jsonify({"status": "reset"})

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
    port = int(os.getenv("PORT", 5001))
    debug_mode = os.getenv("FLASK_ENV") == "development"
    app.run(debug=debug_mode, host='0.0.0.0', port=port)