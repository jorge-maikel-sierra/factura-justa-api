# factura-justa-api

API en AdonisJS v6 (Node.js ESM + TypeScript) para "Factura Justa". Incluye autenticación por tokens, ORM Lucid con MySQL, CI/CD en GitHub Actions y despliegue continuo en Fly.io.

## 🚀 Características

- AdonisJS v6 con TypeScript y ESM
- Autenticación con `@adonisjs/auth` (guard api) + OAuth Google
- Lucid ORM con MySQL
- **Documentación Swagger/OpenAPI completa** con `adonis-autoswagger`
- Migraciones y pruebas con Japa
- CI (lint, typecheck, test) y CD (deploy a Fly.io) en GitHub Actions
- Dockerfile multi-stage para builds rápidos
- docker-compose para entornos locales: MySQL + MSSQL (para servidor MCP opcional)

## 📦 Requisitos

- Node.js 20+
- npm 10+
- Docker (opcional para DB local)

## 🧩 Estructura del proyecto

- `app/` modelos, middleware, excepciones
- `start/` kernel y rutas (`GET /` responde `{ hello: 'world' }`)
- `config/` configuración de app, DB, logger, auth
- `database/migrations/` migraciones de Lucid
- `bin/server.ts` entrada HTTP para producción
- `.github/workflows/` CI y CD

## 🔧 Configuración de entorno

Variables validadas en `start/env.ts`:

- Generales: `NODE_ENV`, `PORT`, `APP_KEY`, `HOST`, `LOG_LEVEL`
- Base de datos MySQL: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`

Ejemplo `.env` local (ajusta credenciales):

```
NODE_ENV=development
PORT=3333
APP_KEY=changeme
HOST=127.0.0.1
LOG_LEVEL=info

DB_HOST=127.0.0.1
DB_PORT=13306
DB_USER=root
DB_PASSWORD=root
DB_DATABASE=factura_justa
```

## 🐳 Desarrollo local

- Levantar MySQL con docker-compose:
  - `docker compose up -d mysql`
- Instalar dependencias e iniciar servidor dev (HMR):
  - `npm ci`
  - `npm run dev`
- Ejecutar migraciones:
  - `node ace migration:run`

## 📚 Documentación API (Swagger/OpenAPI)

### Acceso Rápido

Una vez que el servidor esté corriendo:

- **Swagger UI (Interfaz Interactiva)**: http://localhost:3333/docs
- **Especificación JSON**: http://localhost:3333/swagger

### Endpoints Documentados

#### Autenticación Tradicional

- `POST /auth/register` - Registro de usuario con email/password
- `POST /auth/login` - Inicio de sesión
- `POST /auth/logout` - Cerrar sesión (requiere autenticación)
- `GET /auth/me` - Obtener perfil del usuario autenticado

#### Autenticación Social (Google OAuth)

- `GET /auth/google/redirect` - Iniciar flujo de autenticación con Google
- `GET /auth/google/callback` - Callback de Google OAuth con unificación de cuentas

### Características de la Documentación

✅ **Esquemas OpenAPI 3.0** completos para todos los requests y responses  
✅ **Autenticación JWT** integrada en Swagger UI (botón Authorize)  
✅ **Validaciones** documentadas con ejemplos de errores  
✅ **Ejemplos realistas** en cada endpoint  
✅ **Interfaz interactiva** para probar la API directamente  
✅ **Unificación de cuentas** Google OAuth explicada

### Guía Rápida

1. **Iniciar servidor**: `npm run dev`
2. **Abrir Swagger UI**: http://localhost:3333/docs
3. **Probar registro**: `POST /auth/register` con email, password y fullName
4. **Copiar token** de la respuesta
5. **Autorizar**: Clic en 🔒 Authorize, pegar token
6. **Probar endpoint protegido**: `GET /auth/me`

### Documentación Detallada

- **Guía Rápida**: `docs/SWAGGER_QUICK_START.md`
- **Configuración Completa**: `docs/swagger-setup.md`
- **Esquemas Definidos**: Ver `config/swagger.ts`

## ✅ Calidad (CI)

Workflow `.github/workflows/ci.yml`:

- lint: ESLint
- typecheck: TypeScript `--noEmit`
- test: arranca MySQL como servicio, ejecuta migraciones y luego `npm test`

## 🧪 Tests

- Ejecuta: `npm test`
- Suites definidas en `adonisrc.ts` (unit y functional)

## 📦 Build

- Compilar a producción: `npm run build` (usa `node ace build`)
- Artefacto: carpeta `build/` con entrada `bin/server.js`

## 🚢 Despliegue continuo (Fly.io)

- Archivos clave: `Dockerfile`, `fly.toml`, `.github/workflows/deploy-fly.yml`
- Requisitos:
  - Secreto en GitHub: `FLY_API_TOKEN`
  - Secretos en Fly: `APP_KEY`, `HOST=0.0.0.0`, `PORT=8080`, `LOG_LEVEL=info`, `DB_*`
- Primer despliegue manual recomendado:
  - `fly auth login`
  - `fly launch --no-deploy`
  - `fly secrets set APP_KEY=... HOST=0.0.0.0 PORT=8080 LOG_LEVEL=info DB_HOST=... DB_PORT=3306 DB_USER=... DB_PASSWORD=... DB_DATABASE=...`
  - `fly deploy --remote-only`
- CI/CD: cada push a `main` despliega automáticamente.

Solución a error de buildpacks en Fly (`/tmp/manifest.json`): en `fly.toml` se fuerza el Dockerfile con:

```
[build]
  dockerfile = "Dockerfile"
```

## 🗄️ Base de datos

- Local: docker-compose expone MySQL en `127.0.0.1:13306`
- CI: servicio MySQL interno en GitHub Actions
- Producción: usa MySQL gestionado (PlanetScale, Aiven, RDS). Ajusta `DB_*`.

## 🧰 Servidor MCP MSSQL (opcional)

- `docker-compose.yml` incluye `mssql` y `mssql-mcp`.
- El servidor MCP trabaja por stdio; se usa con clientes compatibles (no es parte de la API).

## 📝 Convenciones

- Commits: Conventional Commits en español (ver `.github/commit-message-template.md`)
- Estilo: ESLint + Prettier (Adonis presets)
- Nombres: español y acorde al dominio (e.g., `emitirTokenDeAcceso`)

## 🤝 Contribuir

- Crear rama desde `main`
- Asegurar CI verde (lint, typecheck, tests)
- Abrir PR con descripción clara

## 📄 Licencia

UNLICENSED
