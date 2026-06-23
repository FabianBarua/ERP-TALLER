FROM node:22-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build:server

FROM node:22-slim

WORKDIR /app

ENV NODE_ENV=production
ENV API_ONLY=true

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist/server.cjs ./dist/server.cjs

EXPOSE 3000

CMD ["node", "dist/server.cjs"]
