# MCP para SQL Server (MSSQL)

Este documento explica cómo construir y ejecutar un servidor MCP para MSSQL usando la imagen `mssql-mcp:latest`.

## Requisitos

- Docker Desktop
- .NET SDK (para construir la imagen con `dotnet publish`)
- Un SQL Server accesible (local en Docker o remoto)

## Construir la imagen

1. Clona el repo del servidor (ejemplo recomendado):

```bash
git clone https://github.com/Aaronontheweb/mssql-mcp.git
cd mssql-mcp
```

2. Publica la imagen Docker:

```bash
dotnet publish --os linux --arch x64 /t:PublishContainer
```

Esto creará la imagen `mssql-mcp:latest` localmente.

## Ejecutar el servidor MCP

Conecta al SQL Server que ya tengas corriendo (ajusta DB/usuario/clave):

```bash
docker run -it --rm \
  -e MSSQL_CONNECTION_STRING="Server=host.docker.internal,1433; Database=TuDB; User Id=tuUsuario; Password=tuPass; TrustServerCertificate=true;" \
  mssql-mcp:latest
```

En Apple Silicon (arm64) a menudo la imagen es amd64; añade:

```bash
--platform linux/amd64
```

## Integración en VS Code o clientes MCP

Ejemplo de configuración para clientes que aceptan `mcpServers`:

```json
{
  "mcpServers": {
    "mssql": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "-e", "MSSQL_CONNECTION_STRING", "mssql-mcp:latest"],
      "env": {
        "MSSQL_CONNECTION_STRING": "Server=host.docker.internal,1433; Database=TuDB; User Id=tuUsuario; Password=tuPass; TrustServerCertificate=true;"
      }
    }
  }
}
```

## Tareas en VS Code

Se agregaron tareas en `.vscode/tasks.json`:

- `mcp-mssql: build image`: construye la imagen con `dotnet publish`
- `mcp-mssql: run (docker)`: ejecuta el contenedor pidiendo la cadena de conexión (incluye `--platform linux/amd64`)
- `compose: up (mssql + mcp)`: levanta `azure-sql-edge` y `mssql-mcp` con `docker compose`
- `compose: down`: detiene y limpia volúmenes

## Notas

- Si ves error 125 al ejecutar `docker run`, normalmente es que la imagen `mssql-mcp:latest` no existe. Asegúrate de construirla antes.
- En macOS, `host.docker.internal` permite que el contenedor se conecte al servicio del host.
- Para solo lectura, usa un usuario de base de datos con permisos `SELECT` únicamente.

## Opción con docker-compose

Incluido `docker-compose.yml` que arranca:

- `mssql` (Azure SQL Edge, compatible arm64) en `localhost:1433`
- `mssql-mcp` (forzado a `linux/amd64`) dependiente de `mssql`

Usa un `.env` con `SA_PASSWORD` (ver `.env.example`).

Arrancar:

```bash
docker compose up -d
```

Parar y limpiar:

```bash
docker compose down -v
```
