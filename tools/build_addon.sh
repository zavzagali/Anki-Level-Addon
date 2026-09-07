#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# Build TypeScript → web/
echo "Building TypeScript..."
export PATH="/home/novo/.local/node/bin:$PATH"
npm run build

# Build .ankiaddon zip
version="$(python3 -c "import json; print(json.load(open('manifest.json'))['human_version'])")"
out="${1:-../levelup_anki-${version}.ankiaddon}"

find . -name '__pycache__' -type d -prune -exec rm -rf {} +

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
pkg="$tmp/package.ankiaddon"

zip -rq "$pkg" . \
    -x '.git/*' \
    -x '.github/*' \
    -x '__pycache__/*' -x '*/__pycache__/*' -x '*.pyc' \
    -x '.DS_Store' -x '*/.DS_Store' \
    -x 'docs/*' \
    -x 'tools/*' \
    -x 'dist/*' \
    -x 'src/*' \
    -x 'node_modules/*' \
    -x '.gitignore' \
    -x 'meta.json' \
    -x '*.ankiaddon' \
    -x 'package.json' \
    -x 'package-lock.json' \
    -x 'tsconfig.json' \
    -x 'esbuild.config.mjs'

mkdir -p "$(dirname "$out")"
out="$(cd "$(dirname "$out")" && pwd)/$(basename "$out")"
rm -f "$out"
mv "$pkg" "$out"

count="$(zip -Z1 "$out" | grep -cv '/$' || true)"
echo "$out"
echo "  version $version, $count files, $(du -h "$out" | cut -f1)"
