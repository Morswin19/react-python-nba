"""
Build the player_stats cache from the eoinamoore Kaggle box-score dataset
(CC0-1.0, public domain). Aggregates per-game box scores into per-season,
per-franchise totals + career totals — the exact shape the frontend expects.

Why this instead of nba_api:
- CC0 dataset, downloaded as a file (no scraping, no IP throttle/ban).
- Updatable with one `kaggle datasets download` + re-run (see STATS_CACHE.md).
- personId == NBA official id == nba_api id, so /api/search (nba_api static)
  stays compatible with no changes.

Team abbreviations: the dataset's historical codes (SF, NJ, ...) don't match the
frontend's TEAM_HISTORY lists. So we map every season to the CURRENT franchise
abbreviation via teamId (stable franchise id) -> the row still active
(seasonActiveTill = 2100). Points always bucket to the modern code (GSW, OKC,
BKN, ...), which are exactly the matrix's row/col keys.

Usage (run anywhere with the DATASET_DIR files + DATABASE_URL):
    cd backend
    source venv/bin/activate
    python3 import_from_dataset.py

Point DATASET_DIR at the folder holding PlayerStatistics.csv, Players.csv,
TeamHistories.csv.
"""

import csv
import os
import sys
from collections import defaultdict

from main import app, db, PlayerStats

csv.field_size_limit(sys.maxsize)

DATASET_DIR = os.getenv(
    "DATASET_DIR",
    "/private/tmp/claude-501/-Users-piotrkalman-Projekty-react-python-nba/"
    "6e9b0d56-f0da-4aea-8ee8-99e7c16ff91c/scratchpad/kaggle_box",
)
REGULAR_SEASON = "Regular Season"


def build_team_abbrev_maps(path):
    """Two maps to a franchise's CURRENT abbreviation:
      by_id:   teamId          -> current abbrev   (primary)
      by_name: (city, name)    -> current abbrev   (fallback; ~46k box-score
               rows have a blank playerteamId but a valid team name)
    'Current' = the abbrev on the franchise's most-recent (max seasonActiveTill)
    row. On a (city,name) collision between franchises (e.g. the original
    Charlotte Hornets, now Pelicans, vs today's Hornets) the still-active
    franchise wins."""
    rows = list(csv.DictReader(open(path, newline="")))
    best_id = {}  # teamId -> (till, abbrev)
    for r in rows:
        tid, abbr, till = r["teamId"].strip(), r["teamAbbrev"].strip(), int(r["seasonActiveTill"])
        if tid not in best_id or till > best_id[tid][0]:
            best_id[tid] = (till, abbr)
    by_id = {tid: abbr for tid, (till, abbr) in best_id.items()}

    best_name = {}  # (city, name) -> (franchise_till, current_abbrev)
    for r in rows:
        tid = r["teamId"].strip()
        key = (r["teamCity"].strip(), r["teamName"].strip())
        till, cur = best_id[tid]
        if key not in best_name or till > best_name[key][0]:
            best_name[key] = (till, cur)
    by_name = {k: v[1] for k, v in best_name.items()}
    return by_id, by_name


def build_name_map(path):
    names = {}
    with open(path, newline="") as f:
        for row in csv.DictReader(f):
            names[row["personId"].strip()] = f"{row['firstName']} {row['lastName']}".strip()
    return names


def season_id(game_date):
    """'2018-10-20 ...' -> '2018-19'  (NBA season starts in October)."""
    year = int(game_date[:4])
    month = int(game_date[5:7])
    start = year if month >= 10 else year - 1
    return f"{start}-{str(start + 1)[2:]}"


def main():
    team_by_id, team_by_name = build_team_abbrev_maps(
        os.path.join(DATASET_DIR, "TeamHistories.csv"))
    names = build_name_map(os.path.join(DATASET_DIR, "Players.csv"))
    print(f"teams: {len(team_by_id)} by id, {len(team_by_name)} by name | players named: {len(names)}")

    # (personId, season, abbrev) -> [pts, reb, ast, games]
    agg = defaultdict(lambda: [0, 0, 0, 0])
    unmapped_team = 0
    rows = 0

    with open(os.path.join(DATASET_DIR, "PlayerStatistics.csv"), newline="") as f:
        for r in csv.DictReader(f):
            if r["gameType"] != REGULAR_SEASON:
                continue
            rows += 1
            abbr = team_by_id.get(r["playerteamId"].strip()) or \
                team_by_name.get((r["playerteamCity"].strip(), r["playerteamName"].strip()))
            if not abbr:
                unmapped_team += 1
                continue
            key = (r["personId"].strip(), season_id(r["gameDate"]), abbr)
            cell = agg[key]
            cell[0] += int(float(r["points"] or 0))
            cell[1] += int(float(r["reboundsTotal"] or 0))
            cell[2] += int(float(r["assists"] or 0))
            cell[3] += 1

    print(f"regular-season rows: {rows} | unmapped-team rows skipped: {unmapped_team}")

    # regroup per player -> season rows + career totals
    players = defaultdict(list)
    for (pid, season, abbr), (pts, reb, ast, gp) in agg.items():
        players[pid].append(
            {"SEASON_ID": season, "TEAM_ABBREVIATION": abbr,
             "GP": gp, "PTS": pts, "REB": reb, "AST": ast}
        )

    payloads = []
    for pid, seasons in players.items():
        seasons.sort(key=lambda s: (s["SEASON_ID"], s["TEAM_ABBREVIATION"]))
        payloads.append({
            "player_id": int(pid),
            "player_name": names.get(pid),
            "stats": seasons,
            "career_totals": {
                "PTS": sum(s["PTS"] for s in seasons),
                "REB": sum(s["REB"] for s in seasons),
                "AST": sum(s["AST"] for s in seasons),
            },
        })

    print(f"players to write: {len(payloads)}")

    with app.app_context():
        # dataset is source of truth -> rebuild the table
        deleted = db.session.query(PlayerStats).delete()
        db.session.commit()
        print(f"cleared old rows: {deleted}")

        for i, p in enumerate(payloads, 1):
            db.session.add(PlayerStats(player_id=p["player_id"], data=p))
            if i % 1000 == 0:
                db.session.commit()
                print(f"  written {i}/{len(payloads)}")
        db.session.commit()
        print(f"done. player_stats now: {db.session.query(PlayerStats).count()}")


if __name__ == "__main__":
    main()
