# Multi-stage Dockerfile for backend with Nginx

# Stage 1: Build and run Node.js app
FROM node:lts AS backend-build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000

# Stage 2: Serve using Nginx
FROM nginx:alpine

# Copy Nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy backend app code
COPY --from=backend-build /app /app

# Install Node.js inside nginx container to run Express
RUN apk add --no-cache nodejs npm

# Set working directory and expose port 80 (Nginx)
WORKDIR /app
EXPOSE 80

# Start Express app and Nginx together
CMD sh -c "node server.js & nginx -g 'daemon off;'"
