#!/usr/bin/env bash
# Reads NetNewsWire's local store. No network, no tokens, no cost.
#
# feedID is the feed's xmlUrl, so it maps straight onto sources/subscriptions.opml.
# Default window is 24 hours; pass a different one, e.g. `news-sweep.sh '-7 day'`.
#
# If this exits non-zero the store is unreadable — a sandboxed launchd job may be
# refused access to another app's container. Fall back to fetching the feeds in
# sources/subscriptions.opml directly.
set -euo pipefail
WINDOW="${1:--1 day}"
DB="$HOME/Library/Containers/com.ranchero.NetNewsWire-Evergreen/Data/Library/Application Support/NetNewsWire/Accounts/OnMyMac/DB.sqlite3"
[ -r "$DB" ] || { echo "news-sweep: cannot read $DB" >&2; exit 1; }

sqlite3 -readonly -separator $'\t' "$DB" "
  select feedID,
         date(datePublished,'unixepoch'),
         replace(coalesce(nullif(title,''),'(untitled)'), char(9), ' '),
         coalesce(nullif(url,''), externalURL, '')
  from articles
  where datePublished > strftime('%s','now','$WINDOW')
    and coalesce(nullif(url,''), externalURL, '') != ''
  order by datePublished desc;
"
