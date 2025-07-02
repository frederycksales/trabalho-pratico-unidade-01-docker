# Stage 1: Build React application
FROM node:18.17.0-alpine AS build

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies for build
RUN npm ci

COPY . .

# Set backend URL for build
ENV REACT_APP_BACKEND_URL=/api

# Build React application
RUN npm run build

# Stage 2: NGINX configuration
FROM nginx:alpine

# Remove default nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy React static files from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
