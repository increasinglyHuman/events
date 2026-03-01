#!/usr/bin/env bash
set -euo pipefail

# ── poqpoq Events API — Deploy to production ────────────────
# Builds TypeScript, syncs to server, restarts via systemd
# NOTE: Uses systemd (not PM2) following NEXUS pattern

SSH_KEY="$HOME/.ssh/poqpoq-new.pem"
SSH_HOST="ubuntu@poqpoq.com"
REMOTE_DIR="/home/ubuntu/events-api"

echo "═══ poqpoq Events API Deploy ═══"

# 1. Build
echo "→ Building TypeScript..."
npm run build

# 2. Ensure remote directory + log directory exists
echo "→ Ensuring remote directories..."
ssh -i "$SSH_KEY" "$SSH_HOST" "mkdir -p $REMOTE_DIR && sudo mkdir -p /var/log/bbworlds"

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

# 5. Install production deps
echo "→ Installing dependencies..."
ssh -i "$SSH_KEY" "$SSH_HOST" "cd $REMOTE_DIR && npm ci --omit=dev"

# 6. Install systemd service if not present, then restart
echo "→ Restarting service (systemd)..."
ssh -i "$SSH_KEY" "$SSH_HOST" "
  if [ ! -f /etc/systemd/system/events-api.service ]; then
    echo '  Installing systemd service...'
    sudo cp $REMOTE_DIR/events-api.service /etc/systemd/system/
    sudo systemctl daemon-reload
    sudo systemctl enable events-api
  fi
  sudo systemctl restart events-api
  sleep 2
  sudo systemctl status events-api --no-pager
"

echo ""
echo "═══ Deploy complete ═══"
echo "Health:  https://poqpoq.com/events-api/health"
echo "Logs:    ssh poqpoq.com 'sudo journalctl -u events-api -f'"
echo ""
