# Multi-stage build for production
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm ci --only=production

# Copy client dependencies and build React app
WORKDIR /app/client
RUN npm ci
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install sqlite3
RUN apk add --no-cache sqlite

# Create app directory
WORKDIR /app

# Copy server dependencies
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Copy server code
COPY server/ ./server/

# Copy built React app
COPY --from=builder /app/client/build ./client/build

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/filters', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "server/index.js"]
