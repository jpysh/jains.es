#!/usr/bin/env bash
# The build refusing bad input IS the mechanism. This checks it still refuses.
# Run it after touching validation in site.js. No framework, no fixtures dir.
set -uo pipefail
cd "$(dirname "$0")/.."
TMP_W=content/wiki/.check.md
TMP_L=content/days/.check.md
fails=0

try() { # name, file, content, expected-substring
  printf '%s' "$3" > "$2"
  out=$(node build/site.js 2>&1); code=$?
  rm -f "$2"
  if [ $code -eq 0 ]; then echo "FAIL: $1 — build exited 0, should have refused"; fails=$((fails+1));
  elif ! grep -qF "$4" <<<"$out"; then echo "FAIL: $1 — no '$4' in output"; fails=$((fails+1));
  else echo "ok: $1"; fi
}

mkdir -p content/wiki content/days

try "wiki: unknown stage" "$TMP_W" \
'---
title: X
stage: sprouting
created: 2026-01-01
summary: s
tags: meta
---
body' "unknown stage"

try "wiki: evergreen with no sources" "$TMP_W" \
'---
title: X
stage: evergreen
created: 2026-01-01
summary: s
tags: meta
---
body' "no sources"

try "wiki: a YAML list where a comma string belongs" "$TMP_W" \
'---
title: X
stage: seedling
created: 2026-01-01
summary: s
tags:
  - one
  - two
---
body' "cannot parse front matter line"

try "wiki: no tags, so no cluster to file it under" "$TMP_W" \
'---
title: X
stage: seedling
created: 2026-01-01
summary: s
---
body' "no tags"

try "edition: day is not a number" "$TMP_L" \
'---
title: X
day: one
date: 2026-01-01
summary: s
sources:
  - primary | P | 2026-01-01 | T | https://example.com
---
body' "day must be a whole number"

node build/site.js >/dev/null 2>&1 || { echo "FAIL: clean tree does not build"; fails=$((fails+1)); }
[ $fails -eq 0 ] && echo "all checks pass" || { echo "$fails failing"; exit 1; }
