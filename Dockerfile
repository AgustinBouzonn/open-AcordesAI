# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Las variables VITE_ se inyectan en build time
ARG VITE_GEMINI_API_KEY
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY

RUN npm run build \
 && WORKBOX_FILE="$(find dist -maxdepth 1 -name 'workbox-*.js' | head -n 1)" \
 && cp "$WORKBOX_FILE" dist/workbox.js \
 && sed -i -E 's#\./workbox-[^"]+#./workbox#' dist/sw.js

# Stage 2: Serve con Nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO /dev/null http://127.0.0.1/index.html || exit 1

CMD ["nginx", "-g", "daemon off;"]
