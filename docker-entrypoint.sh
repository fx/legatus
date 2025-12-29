#!/bin/bash
set -e

# Runtime theme selection (default: use build-time theme already in /srv)
if [ -n "$THEME" ]; then
  if [ -d "/themes/$THEME" ]; then
    echo "Applying theme: $THEME"
    cp "/themes/$THEME/index.html" /srv/
    cp "/themes/$THEME/styles.css" /srv/
  else
    echo "Warning: Theme '$THEME' not found, using default"
  fi
fi

# Start Gatus in the background
echo "Starting Gatus..."
GATUS_CONFIG_PATH=/config/config.yaml /usr/local/bin/gatus &

# Start Caddy in the foreground
echo "Starting Caddy..."
exec caddy run --config /etc/caddy/Caddyfile --adapter caddyfile
