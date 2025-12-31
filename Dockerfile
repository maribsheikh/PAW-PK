### Multi-stage Dockerfile for production
# - Builds frontend using Node
# - Copies built frontend into backend and installs production deps
# - Uses non-root user for security
# - Includes health check

FROM node:18-bullseye-slim AS builder-frontend
WORKDIR /app/frontend

# Install dependencies first (better layer caching)
COPY frontend/package*.json ./
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
RUN npm ci --only=production

# Copy source and build
COPY frontend/ ./
RUN npm run build

# Production runtime stage
FROM node:18-bullseye-slim AS runtime

# Install runtime dependencies
RUN apt-get update \
  && apt-get install -y \
  libvips-dev \
  ca-certificates \
  curl \
  tini \
  && rm -rf /var/lib/apt/lists/* \
  && apt-get clean

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

WORKDIR /app/backend

# Copy backend package files and install production dependencies
COPY backend/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy backend source
COPY backend/ ./

# Copy built frontend into backend so server can serve it
COPY --from=builder-frontend /app/frontend/dist ../frontend/dist

# Create necessary directories and set permissions
RUN mkdir -p uploads logs \
  && chown -R appuser:appuser /app \
  && chmod -R 755 /app

# Switch to non-root user
USER appuser

# Environment variables
ENV NODE_ENV=production \
  BACKEND_PORT=3001 \
  PORT=3001

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

# Use tini to handle signals properly
ENTRYPOINT ["/usr/bin/tini", "--"]

# Start the application
CMD ["node", "server.js"]
