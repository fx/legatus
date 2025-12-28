# Stage 1: Build Gatus from vendored source
FROM golang:1.23-alpine AS gatus-builder

WORKDIR /build
COPY vendor/gatus .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o gatus .

# Stage 2: Build frontend
FROM oven/bun:1-alpine AS frontend-builder

WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

# Stage 3: Runtime with Caddy + Gatus + frontend
FROM caddy:2.9-alpine

# Install bash for entrypoint script
RUN apk add --no-cache bash

# Copy Gatus binary
COPY --from=gatus-builder /build/gatus /usr/local/bin/gatus

# Copy frontend static files
COPY --from=frontend-builder /app/index.html /srv/
COPY --from=frontend-builder /app/styles.css /srv/
COPY --from=frontend-builder /app/dist /srv/dist

# Copy Caddy configuration
COPY Caddyfile /etc/caddy/Caddyfile

# Copy entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Create config directory for Gatus
RUN mkdir -p /config

EXPOSE 80

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
