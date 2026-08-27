# Backend Dockerfile for AWS App Runner / AWS ECS / Elastic Beanstalk
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests and install dependencies
COPY package*.json ./
RUN npm ci

# Copy TypeScript source and configurations
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript to Javascript (dist directory)
RUN npm run build

# Production Runtime Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy compiled JavaScript from builder
COPY --from=builder /app/dist ./dist

EXPOSE 5000

# Start production Express server
CMD ["node", "dist/server.js"]
