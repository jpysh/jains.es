#!/bin/sh
# Every source URL in the given Markdown files must answer 2xx or 3xx.
# Usage: build/check-links.sh content/days/2026-09-25.md content/wiki/foo.md
# Proves the link resolves, not that it carries the claim; the audit checks that.
fail=0
for url in $(grep -ho 'https\?://[^ )>"]*' "$@" | sort -u); do
  code=$(curl -sL -o /dev/null -w '%{http_code}' -A 'Mozilla/5.0' --max-time 20 "$url")
  case $code in 2*|3*) echo "ok   $code $url" ;; *) echo "FAIL $code $url"; fail=1 ;; esac
done
exit $fail
