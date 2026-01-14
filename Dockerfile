# Stage 1: Build the frontend
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Production server
FROM node:20-slim

WORKDIR /app

# Copy only production dependencies for the server
COPY package*.json ./
RUN npm install --omit=dev

# Copy the built frontend from stage 1
COPY --from=builder /app/dist ./dist

# Copy the server files
COPY server.js ./
COPY backend ./backend
# If you have GCS key locally for testing, but in production, it's better to use Service Accounts
# COPY gcs-key.json ./ 

# The PORT environment variable is automatically provided by Cloud Run (defaulting to 8080).
# Your server.js already handles process.env.PORT, so no extra config is needed here.

CMD ["npm", "start"]
