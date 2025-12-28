FROM caddy:2.9-alpine
COPY index.html /srv/
COPY styles.css /srv/
COPY Caddyfile /etc/caddy/Caddyfile
EXPOSE 80
