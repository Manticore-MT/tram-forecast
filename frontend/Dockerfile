# Static build: no server runtime needed, Caddy just serves the compiled dist/.
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM caddy:2-alpine
LABEL org.opencontainers.image.source="https://github.com/Manticore-MT/tram-forecast"
COPY --from=build /app/dist /srv
COPY Caddyfile /etc/caddy/Caddyfile
