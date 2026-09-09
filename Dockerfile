# Multi-stage build for FreeDomain Platform
FROM node:22-alpine AS builder

WORKDIR /app

# Build client
COPY client/package*.json ./client/
RUN cd client && npm install

COPY client/ ./client/
RUN cd client && npm run build

# Setup production server
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev

COPY server/ ./server/
COPY --from=builder /app/client/dist ./client/dist

EXPOSE 5000

CMD ["node", "server/index.js"]