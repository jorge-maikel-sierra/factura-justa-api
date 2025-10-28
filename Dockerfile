# Multi-stage build para AdonisJS v6 (Node.js ESM + TypeScript)

FROM node:20-alpine AS build
WORKDIR /app

# Instalar dependencias (usa lockfile si existe)
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copiar el resto del código fuente
COPY . .

# Compilar a producción (genera carpeta build con package.json propio)
RUN node ace build --production


FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=8080 \
    LOG_LEVEL=info

# Copiar artefactos de build (incluye package.json de producción)
COPY --from=build /app/build ./

# Instalar dependencias de producción para el artefacto compilado
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

EXPOSE 8080

# Comando de arranque (Ignitor HTTP)
CMD ["node", "bin/server.js"]
