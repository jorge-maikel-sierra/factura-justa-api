# Base de datos — Guía rápida

## Levantar MySQL (app)

- Requisitos: Docker Desktop
- Arranca MySQL con Docker Compose:

```bash
docker compose up -d mysql
```

- Conexión local:

```bash
mysql -h 127.0.0.1 -P 13306 -uroot -proot -e "SELECT 1"
```

## Variables de entorno (MySQL)

En `.env` (y `.env.example`) se definen:

```
DB_HOST=127.0.0.1
DB_PORT=13306
DB_USER=root
DB_PASSWORD=root
DB_DATABASE=factura_justa
```

## Migraciones (AdonisJS)

- Generar APP_KEY si falta:

```bash
node ace generate:key
```

- Ejecutar migraciones:

```bash
node ace migration:run
```

## SQL Server para MCP (opcional)

Consulta `docs/mcp-mssql.md` para construir la imagen del servidor MCP y ejecutar SQL Server (Azure SQL Edge).
