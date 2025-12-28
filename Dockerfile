# Build stage
FROM oven/bun:1 AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source files
COPY . .

# Build the application
RUN bun run build

# Production stage
FROM caddy:2-alpine

# Copy built assets from builder
COPY --from=builder /app/dist /srv

# Copy Caddy configuration
COPY Caddyfile /etc/caddy/Caddyfile

EXPOSE 80
