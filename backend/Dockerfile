# ────────────────────────────────────────────────────────────────
#  Dockerfile — Backend (Node.js / Express)
# ────────────────────────────────────────────────────────────────
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (Docker layer caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Create uploads directory (persisted via Docker volume)
RUN mkdir -p uploads/resumes uploads/recordings

# Expose backend port
EXPOSE 5055

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:5055/ || exit 1

# Start server
CMD ["node", "server.js"]
