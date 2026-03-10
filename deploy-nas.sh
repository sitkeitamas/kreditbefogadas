#!/usr/bin/env bash
# Deploy a Macről a NAS-ra: feltölti a fájlokat és restartolja a konténert.
# Használat: ./deploy-nas.sh   (vagy: bash deploy-nas.sh)
set -e

NAS_USER="${NAS_USER:-sitkeitamas}"
NAS_HOST="${NAS_HOST:-dsm.sitkeitamas.hu}"
NAS_PATH="${NAS_PATH:-/volume1/docker/kreditbefogadas}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "Deploy -> ${NAS_USER}@${NAS_HOST}:${NAS_PATH}"
scp server-working.js "${NAS_USER}@${NAS_HOST}:${NAS_PATH}/"
scp data/kredit_data.json "${NAS_USER}@${NAS_HOST}:${NAS_PATH}/data/"
[ -f data/2025_creditAccList.xlsx ] && scp data/2025_creditAccList.xlsx "${NAS_USER}@${NAS_HOST}:${NAS_PATH}/data/" || true
echo "Restarting container..."
ssh "${NAS_USER}@${NAS_HOST}" "docker restart kreditbefogadas-kredit-app-1"
echo "Done."
