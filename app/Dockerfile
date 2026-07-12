# Stage 1: Build the application
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package configuration files
COPY package*.json ./

# Install all dependencies
RUN npm ci

# Copy project files
COPY . .

# Build frontend and compile Hono backend boot file
RUN npm run build

# Stage 2: Production runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package config and install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built bundles from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/db ./db

EXPOSE 3000

CMD ["node", "dist/boot.js"]
