#!/usr/bin/env bash
# Új verzió: VERSION fájl frissítése, deploy NAS-ra, majd commit + tag + push.
# Használat: ./release.sh 2.0.3
set -e

if [ -z "$1" ]; then
  echo "Használat: ./release.sh <verzió>   pl. ./release.sh 2.0.3"
  exit 1
fi

V="$1"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "$V" > VERSION
echo "VERSION -> $V"
./deploy-nas.sh
git add VERSION
git commit -m "Bump VERSION to $V"
git tag -a "v${V}" -m "v${V}"
git push origin main
git push origin "v${V}"
echo "Done: v${V} deployed, committed, tagged, pushed."
