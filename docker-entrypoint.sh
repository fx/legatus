#!/bin/bash
set -e

# Start Gatus in the background
echo "Starting Gatus..."
/usr/local/bin/gatus &

# Start Caddy in the foreground
echo "Starting Caddy..."
exec caddy run --config /etc/caddy/Caddyfile --adapter caddyfile
