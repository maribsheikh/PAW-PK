### Multi-stage Dockerfile for production
# - Builds frontend using Node
# - Copies built frontend into backend and installs production deps

FROM node:18-bullseye-slim AS builder-frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
RUN npm ci
COPY frontend/ .
RUN npm run build

FROM node:18-bullseye-slim AS runtime
WORKDIR /app

# Ensure libvips (used by sharp) is available at runtime
RUN apt-get update \
  && apt-get install -y libvips-dev ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Copy backend package files and install production dependencies
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --production

# Copy backend source
COPY backend/ .

# Copy built frontend into backend so server can serve it
COPY --from=builder-frontend /app/frontend/dist ./frontend/dist

ENV NODE_ENV=production
ENV BACKEND_PORT=3001

EXPOSE 3001

CMD ["node", "server.js"]
