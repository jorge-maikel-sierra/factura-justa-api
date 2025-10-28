# Guía de Despliegue a Producción en Fly.io

## Proceso para desplegar cambios después de crear un endpoint

### 1. Desarrollo Local

```bash
# Inicia el servidor de desarrollo
npm run dev

# Prueba tu nuevo endpoint localmente
# Ejemplo: http://localhost:3333/tu-nuevo-endpoint
```

### 2. Validación de Código

```bash
# Ejecuta el linter
npm run lint

# Ejecuta el type checker
npm run typecheck

# Ejecuta los tests (si existen)
npm test
```

### 3. Control de Versiones

```bash
# Verifica los cambios
git status

# Añade los archivos modificados
git add .

# Commit con mensaje en español siguiendo Conventional Commits
git commit -m "feat(routes): añadir endpoint /nuevo-endpoint"

# Sube los cambios a la rama principal
git push origin main
```

**Tipos de commits recomendados:**

- `feat`: Nueva funcionalidad
- `fix`: Corrección de bugs
- `refactor`: Refactorización de código
- `docs`: Cambios en documentación
- `chore`: Tareas de mantenimiento

### 4. Migraciones de Base de Datos (si aplica)

Si creaste nuevas migraciones:

```bash
# Verifica que las migraciones funcionan localmente
node ace migration:run

# Opcional: Rollback para probar
node ace migration:rollback
node ace migration:run
```

**Nota:** Las migraciones se ejecutan automáticamente en producción durante el despliegue gracias al `release_command` en `fly.toml`.

### 5. Despliegue a Producción

```bash
# Opción 1: Build local (más rápido si tienes buena conexión)
fly deploy --local-only

# Opción 2: Build remoto (usa los builders de Fly.io)
fly deploy --remote-only

# Opción 3: Build por defecto
fly deploy
```

### 6. Verificación Post-Despliegue

```bash
# Verifica el estado de la aplicación
fly status

# Monitorea los logs en tiempo real
fly logs

# Verifica que el endpoint funciona
curl https://factura-justa-api.fly.dev/tu-nuevo-endpoint

# O abre en el navegador
fly open
```

### 7. Rollback (si algo sale mal)

```bash
# Lista los releases anteriores
fly releases

# Vuelve a un release anterior
fly releases rollback <VERSION>
```

## Comandos Útiles

### Gestión de Secretos

```bash
# Listar secretos configurados
fly secrets list

# Añadir o actualizar un secreto
fly secrets set NOMBRE_SECRETO=valor

# Eliminar un secreto
fly secrets unset NOMBRE_SECRETO
```

### Debugging

```bash
# Conectarse por SSH a la máquina
fly ssh console

# Ejecutar un comando específico
fly ssh console -C "node ace list"

# Ver información detallada de las máquinas
fly machine list
```

### Escalado

```bash
# Escalar número de instancias
fly scale count 2

# Cambiar el tamaño de VM
fly scale vm shared-cpu-2x

# Escalar memoria
fly scale memory 512
```

## Checklist de Despliegue

- [ ] Código funciona localmente
- [ ] Lint y typecheck pasan sin errores
- [ ] Tests pasan (si existen)
- [ ] Commit realizado con mensaje descriptivo
- [ ] Push a repositorio remoto
- [ ] Migraciones probadas localmente (si aplica)
- [ ] Despliegue ejecutado con `fly deploy`
- [ ] Logs revisados sin errores críticos
- [ ] Endpoint verificado en producción
- [ ] Documentación actualizada (si aplica)

## Solución de Problemas Comunes

### Error en migraciones

```bash
# Conecta por SSH y ejecuta manualmente
fly ssh console -C "node ace migration:run --force"
```

### Build falla por TypeScript

```bash
# El flag --ignore-ts-errors ya está configurado en Dockerfile
# Si necesitas corregir errores, ejecuta localmente:
npm run typecheck
```

### Base de datos no conecta

```bash
# Verifica las variables de entorno
fly secrets list

# Verifica conectividad
fly ssh console -C "nc -zv $DB_HOST $DB_PORT"
```

### Aplicación no responde

```bash
# Revisa los logs
fly logs

# Reinicia las máquinas
fly machine restart <MACHINE_ID>
```

## Automatización con GitHub Actions (Futuro)

Para automatizar el despliegue en cada push a `main`, crea `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Fly.io
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --remote-only
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

## URLs Importantes

- **App en producción**: https://factura-justa-api.fly.dev/
- **Dashboard Fly.io**: https://fly.io/apps/factura-justa-api
- **Monitoring**: https://fly.io/apps/factura-justa-api/monitoring
- **Documentación Fly.io**: https://fly.io/docs/
