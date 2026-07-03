"""
One-time (repeatable) populate of the PlayerStats cache in Neon.

RUN THIS FROM YOUR LAPTOP — not render. NBA blocks datacenter IPs, so this
only works from your home connection. It writes to Neon (DATABASE_URL), which
render then reads. Render never calls NBA.

Two modes:

    # FILL — first run / resume. Skips players already in DB.
    python3 populate_stats.py

    # REFRESH — re-fetch EVERYONE and overwrite (new seasons, added points,
    # club changes). Use once per season, or weekly during the season.
    python3 populate_stats.py --refresh

FILL is resumable: if it dies (timeout, throttle), run it again — it continues
where it stopped. If you see lots of FAIL lines, NBA is throttling: raise SLEEP
and re-run.

NOTE: must run from your laptop (home IP). NBA blocks datacenter IPs, so you
CANNOT cron this on render/GitHub Actions — those are datacenter too.
To pick up brand-new rookies not yet in nba_api's list: `pip install -U nba_api`
first (the player list is bundled in the package).
"""

import sys
import time

from nba_api.stats.static import players

from main import app, db, PlayerStats, fetch_stats_from_nba

SLEEP = 0.6  # seconds between NBA calls; raise if you get throttled/timeouts


def upsert(pid, payload):
    row = db.session.get(PlayerStats, pid)
    if row:
        row.data = payload
    else:
        db.session.add(PlayerStats(player_id=pid, data=payload))
    db.session.commit()


def main():
    refresh = "--refresh" in sys.argv
    all_players = players.get_players()

    with app.app_context():
        cached = {pid for (pid,) in db.session.query(PlayerStats.player_id).all()}
        # FILL: only missing players. REFRESH: everyone (overwrite).
        todo = all_players if refresh else [p for p in all_players if p["id"] not in cached]
        mode = "REFRESH" if refresh else "FILL"
        print(f"mode={mode} total={len(all_players)} cached={len(cached)} todo={len(todo)}")

        ok = fail = 0
        for i, p in enumerate(todo, 1):
            pid, name = p["id"], p["full_name"]
            try:
                payload = fetch_stats_from_nba(pid)
                upsert(pid, payload)
                ok += 1
                print(f"[{i}/{len(todo)}] OK   {pid} {name}")
            except Exception as e:
                db.session.rollback()
                fail += 1
                print(f"[{i}/{len(todo)}] FAIL {pid} {name}: {type(e).__name__} {e}")
            time.sleep(SLEEP)

        print(f"\nDone. mode={mode} ok={ok} fail={fail}. Re-run to retry the {fail} failures.")


if __name__ == "__main__":
    main()
