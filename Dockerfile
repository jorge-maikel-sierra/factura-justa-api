ARG NODE_VERSION=20.18.1

FROM node:${NODE_VERSION}-alpine AS base

# Instalar dependencias de producción
FROM base AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

# Build de la aplicación
FROM base AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN node ace build --ignore-ts-errors

# Imagen de producción
FROM base
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build /app/build .
EXPOSE 8080
CMD ["node", "bin/server.js"]
