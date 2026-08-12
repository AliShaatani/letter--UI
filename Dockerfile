# =========================================================
# Stage 1: Build React Application
# =========================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies — npm install (not ci) lets npm resolve
# the correct platform-native Rolldown binding for linux/x64
COPY package*.json ./
RUN npm install --prefer-offline

# Copy source code and build production bundle
COPY . .
RUN npm run build

# Bundle pdfjs CMap + Standard Font data alongside the app
# so PDF rendering works without any CDN dependency
RUN cp -r node_modules/pdfjs-dist/cmaps /app/dist/cmaps && \
    cp -r node_modules/pdfjs-dist/standard_fonts /app/dist/standard_fonts

# =========================================================
# Stage 2: Production Nginx Server
# =========================================================
FROM nginx:alpine AS runner

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
