# Stage 1: Build the React application
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:stable-alpine
# Copy built assets from build stage to Nginx web root
COPY --from=build /app/dist /usr/share/nginx/html
# Copy entrypoint script for runtime config
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
# (Optional) Copy custom nginx config if needed
# COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]
