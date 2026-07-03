# Player stats cache (player_stats)

## Why this exists
`stats.nba.com` **blocks datacenter IPs** (render, GitHub Actions, AWS, etc.).
So the render backend **cannot** call NBA live — it got 500 + CORS errors.

Solution: player stats live in Neon (table `player_stats`).
- **render** only reads from Neon — never calls NBA.
- **fetching from NBA** runs on **your laptop** (home IP, NBA doesn't block it).

Flow:

    laptop (home IP)  --fetch-->  stats.nba.com       ✅ works
    laptop            --write-->  Neon (player_stats)  ✅
    render            --read-->   Neon                 ✅ no NBA, no 500

## How the endpoint works
`GET /api/stats/<player_id>` in `main.py`:
1. reads from `player_stats` (the only path render ever uses),
2. cache miss → tries NBA live (works locally, fails on render),
3. whatever it fetched live → writes it back to the DB (self-healing).

Search (`/api/search/<name>`) is local, static data bundled in the nba_api
package — no network, always 200.

## Script: populate_stats.py
Run **from your laptop**, never from render.

    cd backend
    source venv/bin/activate
    python3 populate_stats.py            # FILL:    fetch only missing players (resumable)
    python3 populate_stats.py --refresh  # REFRESH: re-fetch EVERYONE, overwrite

- **FILL** — first run or filling gaps. Skips players already stored.
  If it dies (timeout/sleep), run it again — it continues where it stopped.
- **REFRESH** — updates: new points, new seasons, club changes.
  Run e.g. once per season, or weekly during the season.

Script parameters:
- `SLEEP` (default 0.6s) — delay between NBA calls. Lots of `FAIL` = throttling,
  raise to 1.0–2.0 and re-run.

## Important when running
- **Don't let the Mac sleep** during the run (~1.5h). Sleep suspends the process
  and kills the network. Block sleep with the built-in `caffeinate`:

      # in a separate terminal, PID taken from the running populate:
      caffeinate -i -w $(pgrep -f populate_stats)

  Alternative: leave a video playing / keep the Mac active.
- **New rookies**: the player list is bundled in the nba_api package. To pick up
  fresh players, run `pip install -U nba_api` before REFRESH.

## What CANNOT be fetched
~211 marginal players (undrafted, brief stints, international with an ID only) —
NBA returns an empty `{}` for them → `KeyError 'resultSet'`. This is **not a bug**
on our side, the source is empty. None of them have points for the matrix. Skip.

DB state after a full FILL: ~4924 players (~4863 with real stats
+ ~61 with an empty career), 211 unreachable.

## After an update
Data goes straight to Neon — render sees it immediately, **no deploy needed**.
Deploy (commit + push) only when you change backend CODE.

## Size / limits
The whole table is ~50–150 MB — fits the free Neon tier (0.5 GB) with room to spare.
Check the real size in the Neon SQL editor:

    SELECT pg_size_pretty(pg_total_relation_size('player_stats'));

---

## PROMPT FOR CLAUDE (future use)
Copy-paste this when you want to refresh the stats cache:

> I want to update the NBA player stats cache in Neon (table `player_stats`).
> Context: NBA blocks datacenter IPs, so fetching must run from my laptop, not
> render. The render backend only reads from Neon.
>
> Please:
> 1. (optional, if I want new rookies) `pip install -U nba_api` in the venv.
> 2. Run `python3 populate_stats.py --refresh` from `backend/` in the background
>    (venv active).
> 3. Attach `caffeinate -i -w <PID>` so the Mac won't sleep.
> 4. Report progress every ~20 min by counting rows in `player_stats` on Neon.
> 5. At the end report: how many with real stats, how many empty, how many
>    unreachable (~211 marginal players is normal — NBA returns `{}` for them).
>
> Details in backend/STATS_CACHE.md.
