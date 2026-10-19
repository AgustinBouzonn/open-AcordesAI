FROM node:22-alpine AS builder
WORKDIR /app
# puppeteer es devDependency (solo scripts de import); no hace falta Chromium en la imagen.
ENV PUPPETEER_SKIP_DOWNLOAD=1
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s \
  CMD wget -qO /dev/null http://127.0.0.1:3001/api/health || exit 1
CMD ["node", "dist/index.js"]
