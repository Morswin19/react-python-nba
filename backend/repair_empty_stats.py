"""
Repair false-empty rows in player_stats.

NBA's career endpoint is flaky: a single request sometimes returns a valid but
EMPTY response (0 season rows) even for players who clearly have stats (LeBron,
Ayton, ...). During the bulk populate each player was fetched once, so an unlucky
flaky shot got stored as an empty career.

This script re-fetches every row that currently has empty stats and RETRIES a
few times. If any attempt returns real rows -> update. If it stays empty after
all retries, the player is (probably) genuinely empty -> left as is.

Run from your laptop (NBA blocks datacenter IPs), venv active:

    python3 repair_empty_stats.py
"""

import time

from main import app, db, PlayerStats, fetch_stats_from_nba

RETRIES = 6      # attempts per player before giving up
SLEEP = 1.5      # seconds between attempts / players


def main():
    with app.app_context():
        empties = [r.player_id for r in PlayerStats.query.all()
                   if not r.data.get("stats")]
        print(f"empty rows to repair: {len(empties)}")

        fixed = still_empty = failed = 0
        for i, pid in enumerate(empties, 1):
            got = None
            for attempt in range(1, RETRIES + 1):
                try:
                    payload = fetch_stats_from_nba(pid)
                    if payload["stats"]:          # got real rows
                        got = payload
                        break
                    time.sleep(SLEEP)             # empty -> retry
                except Exception as e:
                    if attempt == RETRIES:
                        print(f"[{i}/{len(empties)}] ERR  {pid}: {type(e).__name__} {e}")
                    time.sleep(SLEEP)
            if got:
                row = db.session.get(PlayerStats, pid)
                row.data = got
                db.session.commit()
                fixed += 1
                print(f"[{i}/{len(empties)}] FIX  {pid} {got['player_name']} -> {len(got['stats'])} seasons")
            else:
                still_empty += 1
                print(f"[{i}/{len(empties)}] SKIP {pid} still empty after {RETRIES} tries")
            time.sleep(SLEEP)

        print(f"\nDone. fixed={fixed} still_empty={still_empty}")


if __name__ == "__main__":
    main()
