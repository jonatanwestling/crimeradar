# Step 1: Build the React application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build production files
COPY . .
RUN npm run build

# Step 2: Serve production build using lightweight Nginx
FROM nginx:alpine

# Clean out default Nginx files
RUN rm -rf /usr/share/nginx/html/*

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy internal Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

