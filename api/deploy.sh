#!/usr/bin/env bash
set -euo pipefail

# ── poqpoq Events API — Deploy to production ────────────────
# Builds TypeScript, syncs to server, restarts PM2

SSH_KEY="$HOME/.ssh/poqpoq-new.pem"
SSH_HOST="ubuntu@poqpoq.com"
REMOTE_DIR="/home/ubuntu/events-api"

echo "═══ poqpoq Events API Deploy ═══"

# 1. Build
echo "→ Building TypeScript..."
npm run build

# 2. Ensure remote directory exists
echo "→ Ensuring remote directory..."
ssh -i "$SSH_KEY" "$SSH_HOST" "mkdir -p $REMOTE_DIR"

# 3. Sync files (exclude dev-only stuff)
echo "→ Syncing to server..."
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.env' \
  --exclude 'src' \
  --exclude 'migrations' \
  -e "ssh -i $SSH_KEY" \
  ./ "$SSH_HOST:$REMOTE_DIR/"

# 4. Sync migrations separately (don't --delete them)
echo "→ Syncing migrations..."
rsync -avz \
  -e "ssh -i $SSH_KEY" \
  ./migrations/ "$SSH_HOST:$REMOTE_DIR/migrations/"

# 5. Install production deps and restart
echo "→ Installing deps & restarting..."
ssh -i "$SSH_KEY" "$SSH_HOST" "cd $REMOTE_DIR && npm ci --omit=dev && pm2 restart events-api 2>/dev/null || pm2 start ecosystem.config.js"

echo "═══ Deploy complete ═══"
echo "Health check: https://poqpoq.com/events-api/health"
