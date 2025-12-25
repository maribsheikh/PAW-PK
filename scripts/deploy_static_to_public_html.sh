#!/usr/bin/env bash
# Build the frontend and copy built files to public_html directory
# Usage: ./scripts/deploy_static_to_public_html.sh [output_dir]

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_DIR="${1:-$ROOT_DIR/public_html}"

echo "Building frontend..."
cd "$ROOT_DIR/frontend"
npm ci
npm run build

echo "Preparing output directory: $OUTPUT_DIR"
rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"

echo "Copying build files to $OUTPUT_DIR"
cp -R "$ROOT_DIR/frontend/dist/"* "$OUTPUT_DIR/"

echo "Done. Files copied to $OUTPUT_DIR"

echo "You can now upload the contents of $OUTPUT_DIR to your Hostinger public_html via SFTP or the control panel."
