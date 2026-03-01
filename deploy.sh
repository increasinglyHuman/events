#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────
# poqpoq Events — Build & Deploy to production
# Target: poqpoq.com/events/ → /var/www/events/
# ─────────────────────────────────────────────

SSH_KEY="$HOME/.ssh/poqpoq-new.pem"
SSH_HOST="ubuntu@poqpoq.com"
REMOTE_DIR="/var/www/events"
LOCAL_OUT="out"

echo "──────────────────────────────────"
echo "  poqpoq Events — Deploy"
echo "──────────────────────────────────"

# 1. Build
echo ""
echo "▸ Building static export..."
npm run build

if [ ! -d "$LOCAL_OUT" ]; then
  echo "✗ Build failed — no 'out' directory found."
  exit 1
fi

echo "✓ Build complete ($(find "$LOCAL_OUT" -name '*.html' | wc -l) HTML pages)"

# 2. Deploy via rsync
echo ""
echo "▸ Deploying to $SSH_HOST:$REMOTE_DIR ..."
rsync -avz --delete \
  -e "ssh -i $SSH_KEY" \
  "$LOCAL_OUT/" \
  "$SSH_HOST:$REMOTE_DIR/"

echo ""
echo "✓ Deployed to https://poqpoq.com/events/"
echo "──────────────────────────────────"
