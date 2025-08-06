FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Install wrangler globally
RUN npm install -g wrangler@latest

# Copy application files
COPY . .

# Create necessary directories
RUN mkdir -p /app/.wrangler/state/d1

# Expose port
EXPOSE 8787

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8787 || exit 1

# Start the application
CMD ["sh", "-c", "npx wrangler dev --local --persist-to /app/.wrangler/state --ip 0.0.0.0 --port 8787"]
