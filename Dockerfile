# Production Dockerfile for enterprise-ot-management-portal
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install all dependencies (including devDependencies for build)
COPY package*.json ./
RUN npm ci

# Copy source code and build Vite frontend + Express backend
COPY . .
RUN npm run build

# Production runner image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package files and install runtime dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built bundle from builder
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/server.cjs"]
