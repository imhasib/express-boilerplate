# ===============================
# Stage 1: Dependencies
# ===============================
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies (including dev for potential build steps)
RUN npm ci

# ===============================
# Stage 2: Production Dependencies
# ===============================
FROM node:20-alpine AS prod-deps

WORKDIR /app

COPY package.json package-lock.json* ./

# Install only production dependencies
RUN npm ci --omit=dev

# ===============================
# Stage 3: Production Runner
# ===============================
FROM node:20-alpine AS runner

# Set environment
ENV NODE_ENV=production

# Install security updates
RUN apk update && apk upgrade && rm -rf /var/cache/apk/*

# Create app directory and set ownership
RUN mkdir -p /app && chown -R node:node /app

WORKDIR /app

# Copy production dependencies from prod-deps stage
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules

# Copy application source
COPY --chown=node:node . .

# Switch to non-root user
USER node

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "src/index.js"]
