import json
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from nba_api.stats.static import players
from nba_api.stats.endpoints import playercareerstats
from flask_sqlalchemy import SQLAlchemy

# 2. Load the variables from .env
load_dotenv()

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class MatrixState(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    # Przechowamy całą macierz jako jeden obiekt JSON w jednej komórce bazy danych
    data = db.Column(db.JSON, nullable=False)

with app.app_context():
    db.create_all()

CORS(app, resources={
    r"/api/*": {
        "origins": [os.getenv("ALLOWED_ORIGIN", "http://localhost:5173")],        
        "methods": ["GET", "POST", "OPTIONS", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})
DATA_FILE = os.getenv("DATA_FILE", "matrix_state.json")

def load_data():
    # Pobieramy pierwszy (i jedyny) rekord z bazy
    state = MatrixState.query.first()
    return state.data if state else {}
        
def save_data(data_dict):
    state = MatrixState.query.first()
    if state:
        state.data = data_dict # Aktualizujemy istniejący rekord
    else:
        new_state = MatrixState(data=data_dict) # Tworzymy pierwszy rekord
        db.session.add(new_state)
    db.session.commit()

@app.route('/api/matrix', methods=['GET'])
def get_matrix():
    data = load_data()
    return jsonify(data)

@app.route('/api/matrix', methods=['POST'])
def add_player_to_matrix():
    current_state = load_data()
    new_entry = request.json # Expecting { "LAL-BOS": { ... } }
    current_state.update(new_entry)
    save_data(current_state)
    return jsonify({"status": "success", "data": current_state})

@app.route('/api/matrix/remove/<cell_key>', methods=['DELETE'])
def remove_player_from_matrix(cell_key):
    current_state = load_data()
    if cell_key in current_state:
        del current_state[cell_key]
        save_data(current_state)
        return jsonify({"status": "success", "data": current_state})
    return jsonify({"error": "Cell not found"}), 404

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
    career = playercareerstats.PlayerCareerStats(
        player_id=player_id, 
        timeout=30
    )
    
    # 1. Get the DataFrames
    df_seasons = career.get_data_frames()[0]
    df_totals = career.get_data_frames()[1]
    
    # 2. IMPORTANT: Replace NaN with 0 (or None)
    # .fillna(0) turns NaN into 0, which is valid JSON
    df_seasons = df_seasons.fillna(0)
    df_totals = df_totals.fillna(0)
    
    player_info = players.find_player_by_id(player_id)
    
    response = jsonify({
        "player_id": player_id,
        "player_name": player_info['full_name'],
        "stats": df_seasons.to_dict(orient='records'),
        "career_totals": df_totals.to_dict(orient='records')[0]
    })

    return response

if __name__ == '__main__':
    port = int(os.getenv("PORT", 5001))
    debug_mode = os.getenv("FLASK_ENV") == "development"
    app.run(debug=debug_mode, host='0.0.0.0', port=port)