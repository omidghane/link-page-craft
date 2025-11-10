# ---- base stage ----
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --verbose --no-audit --no-fund

# ---- dev stage ----
FROM base AS dev
WORKDIR /app

# Copy source code
COPY . .

# Install dev dependencies
RUN npm install --only=dev --no-audit --no-fund

# Expose port (Next.js default port is 3000)
# EXPOSE 3000

# Start the development server (Next.js or other)
# CMD ["npm", "run", "dev"]
