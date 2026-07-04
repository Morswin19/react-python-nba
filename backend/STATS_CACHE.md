# Player stats cache (player_stats)

## Why this exists
`stats.nba.com` has no public API and **blocks datacenter IPs** (render, GitHub
Actions, AWS). So the render backend can't call NBA live — it got 500 + CORS.
Bulk-scraping it from a laptop also trips NBA's anti-scraping (it starts
returning empty `LeagueID 99` responses after a few thousand requests).

Solution: player stats live in Neon (table `player_stats`), built from a
**public-domain Kaggle dataset** (no scraping). render only reads Neon.

    Kaggle CC0 dataset --download file--> laptop --aggregate+write--> Neon
    render --read--> Neon    (never calls NBA, no 500, no throttle)

## Data source
Kaggle: `eoinamoore/historical-nba-data-and-player-box-scores` — **CC0-1.0
(public domain)**, updated ~daily. Per-game box scores for every NBA game since
1947. Its `personId` == NBA official id == nba_api id, so `/api/search`
(nba_api static, offline) stays compatible with no changes.

We use per-game rows and aggregate to per-season, per-franchise **totals** +
career totals — the exact shape the frontend expects
(`stats[].{SEASON_ID,TEAM_ABBREVIATION,PTS,REB,AST}`, `career_totals.{PTS,REB,AST}`).

Team abbreviations are mapped to each franchise's **current** code via the
stable `teamId` (e.g. all Warriors eras -> GSW), so points always bucket to the
matrix's modern row/col keys. `~46k` box-score rows have a blank `playerteamId`
but a valid team name, so there's a `(city,name)` fallback map.

## How the endpoint works
`GET /api/stats/<player_id>` in `main.py`:
1. reads from `player_stats` (the only path render ever uses),
2. cache miss -> tries nba_api live (works locally, fails on render),
3. what it fetched live -> writes back (self-healing).
The read path is **source-agnostic** — it serves whatever populated the table.

## Updating the data (the normal path)
Run from anywhere with the dataset files + `DATABASE_URL` (no NBA access needed,
no throttle — it's a file download, not scraping). Can even be cron'd.

    cd backend
    source venv/bin/activate
    pip install kaggle                      # first time
    # kaggle.json in ~/.kaggle (Settings > API > Create Legacy API Key)
    kaggle datasets download eoinamoore/historical-nba-data-and-player-box-scores \
        -f PlayerStatistics.csv -f Players.csv -f TeamHistories.csv -p <DIR>
    # unzip the .zip files in <DIR> if needed
    DATASET_DIR=<DIR> python3 import_from_dataset.py

`import_from_dataset.py` is destructive by design: it clears `player_stats` and
rebuilds from the dataset (dataset = source of truth). `matrix_state` is not
touched. Cadence: once per season is plenty for a career-points matrix.

Note: dataset career totals differ from NBA's official by ~0.3% (a few games
coded differently between sources) — immaterial for the matrix.

## Escape hatch: nba_api
If you ever want to go back to nba_api as the source, `populate_stats.py`
(+ the live fallback in `main.py`) still work. Run it from a laptop (home IP),
slowly (`SLEEP` 2-4s) and in batches to avoid the anti-scraping throttle.
See git history for details. The read endpoint doesn't change — only which
script fills the table.

## After an update
Data goes straight to Neon — render sees it immediately, **no deploy needed**.
Deploy (commit + push) only when you change backend CODE.

## Size / limits
~50-150 MB in Neon — fits the free tier (0.5 GB). Check real size:

    SELECT pg_size_pretty(pg_total_relation_size('player_stats'));

---

## PROMPT FOR CLAUDE (future use)
Copy-paste when you want to refresh the stats data:

> I want to refresh the NBA player stats in Neon (table `player_stats`) from the
> Kaggle CC0 dataset `eoinamoore/historical-nba-data-and-player-box-scores`.
> Context: render reads from Neon; we build the data from this public dataset,
> not by scraping NBA. Details in backend/STATS_CACHE.md.
>
> Please:
> 1. Download PlayerStatistics.csv, Players.csv, TeamHistories.csv from that
>    dataset (kaggle CLI, creds in ~/.kaggle/kaggle.json).
> 2. Validate the aggregation against a known player (e.g. Curry 201939) before
>    writing — season totals should match within ~0.3%.
> 3. Run `import_from_dataset.py` (DATASET_DIR pointing at the files) to rebuild
>    the table. Report players written and that 0 rows are empty.
