#!/usr/bin/env bash
set -euo pipefail

REPO_URL="https://github.com/heggkj/darts-pats.git"
WORKDIR="${1:-../darts-pats-working}"
STARTER_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if ! command -v git >/dev/null 2>&1; then
  echo "git is required" >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required" >&2
  exit 1
fi

if [ ! -d "$WORKDIR/.git" ]; then
  git clone "$REPO_URL" "$WORKDIR"
fi

rsync -a --delete \
  --exclude '.git' \
  --exclude 'node_modules' \
  --exclude 'dist' \
  --exclude '.astro' \
  "$STARTER_ROOT/" "$WORKDIR/"

cd "$WORKDIR"
npm install
npm run build

git add .
if git diff --cached --quiet; then
  echo "No changes to commit."
else
  git commit -m "Initial 2.5D Darts & Pats town-gown exhibit"
fi

git push origin main
