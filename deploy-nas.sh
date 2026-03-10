#!/usr/bin/env bash
# Deploy a Macről a NAS-ra: feltölti a fájlokat (SSH cat) és restartolja a konténert.
# SCP a Synology-n nem látja a /volume1 útvonalat, ezért SSH-n át pipe-oljuk a fájlokat.
# Használat: ./deploy-nas.sh   (vagy: bash deploy-nas.sh)
set -e

NAS_USER="${NAS_USER:-sitkeitamas}"
NAS_HOST="${NAS_HOST:-dsm.sitkeitamas.hu}"
NAS_PATH="${NAS_PATH:-/volume1/docker/kreditbefogadas}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "Deploy -> ${NAS_USER}@${NAS_HOST}:${NAS_PATH}"
ssh "${NAS_USER}@${NAS_HOST}" "mkdir -p ${NAS_PATH}/data"
ssh "${NAS_USER}@${NAS_HOST}" "cat > ${NAS_PATH}/server-working.js" < server-working.js
[ -f VERSION ] && ssh "${NAS_USER}@${NAS_HOST}" "cat > ${NAS_PATH}/VERSION" < VERSION || true
ssh "${NAS_USER}@${NAS_HOST}" "cat > ${NAS_PATH}/data/kredit_data.json" < data/kredit_data.json
[ -f data/2025_creditAccList.xlsx ] && ssh "${NAS_USER}@${NAS_HOST}" "cat > ${NAS_PATH}/data/2025_creditAccList.xlsx" < data/2025_creditAccList.xlsx || true
echo "Restarting container..."
ssh "${NAS_USER}@${NAS_HOST}" "export PATH=/usr/local/bin:/usr/bin:\$PATH; docker restart kreditbefogadas-kredit-app-1"
echo "Done."
