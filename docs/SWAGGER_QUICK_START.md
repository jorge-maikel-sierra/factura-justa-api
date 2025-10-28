# 🚀 Guía Rápida - Swagger UI

## Acceso Inmediato

Una vez que el servidor esté corriendo, accede a la documentación interactiva:

**🌐 Swagger UI**: http://localhost:3333/docs

**📄 Especificación JSON**: http://localhost:3333/swagger

---

## ✅ Checklist de Implementación Completada

### ✓ Instalación y Configuración

- [x] Paquete `adonis-autoswagger` instalado
- [x] Archivo `config/swagger.ts` configurado con esquemas completos
- [x] Rutas `/docs` y `/swagger` registradas en `start/routes.ts`

### ✓ Esquemas OpenAPI Definidos

- [x] **RegisterRequest** - Esquema de registro
- [x] **LoginRequest** - Esquema de login
- [x] **UserObject** - Objeto de usuario
- [x] **TokenObject** - Objeto de token JWT
- [x] **RegisterResponse** - Respuesta de registro
- [x] **LoginResponse** - Respuesta de login
- [x] **LogoutResponse** - Respuesta de logout
- [x] **MeResponse** - Respuesta de perfil
- [x] **GoogleAuthResponse** - Respuesta OAuth Google
- [x] **ValidationError** - Error de validación (400)
- [x] **UnauthorizedError** - Error no autorizado (401)
- [x] **ForbiddenError** - Error prohibido (403)
- [x] **ConflictError** - Error de conflicto (409)
- [x] **GoogleAuthError** - Error OAuth Google

### ✓ Controladores Documentados

#### AuthController (Autenticación Tradicional)

- [x] `POST /auth/register` - Registro de usuario
- [x] `POST /auth/login` - Inicio de sesión
- [x] `POST /auth/logout` - Cerrar sesión (requiere auth)
- [x] `GET /auth/me` - Obtener perfil (requiere auth)

#### GoogleAuthController (Autenticación Social)

- [x] `GET /auth/google/redirect` - Iniciar flujo OAuth
- [x] `GET /auth/google/callback` - Callback OAuth con unificación

---

## 🎯 Prueba Rápida en 3 Pasos

### Paso 1: Iniciar el Servidor

```bash
npm run dev
```

### Paso 2: Abrir Swagger UI

Navega a: http://localhost:3333/docs

### Paso 3: Probar un Endpoint

#### Registrar un Usuario

1. Expande `POST /auth/register`
2. Haz clic en **Try it out**
3. Edita el JSON de ejemplo:

```json
{
  "email": "test@example.com",
  "password": "Password123!",
  "fullName": "Usuario de Prueba"
}
```

4. Haz clic en **Execute**
5. Copia el `token.value` de la respuesta

#### Probar Endpoint Protegido

1. Haz clic en el botón **🔒 Authorize** (arriba a la derecha)
2. Pega el token copiado
3. Haz clic en **Authorize** y cierra el modal
4. Expande `GET /auth/me`
5. Haz clic en **Try it out** → **Execute**
6. Deberías ver tu información de usuario

---

## 📋 Endpoints Disponibles

### Autenticación Tradicional

| Método | Endpoint         | Descripción         | Auth |
| ------ | ---------------- | ------------------- | ---- |
| POST   | `/auth/register` | Registro de usuario | No   |
| POST   | `/auth/login`    | Inicio de sesión    | No   |
| POST   | `/auth/logout`   | Cerrar sesión       | Sí   |
| GET    | `/auth/me`       | Obtener perfil      | Sí   |

### Autenticación Social (Google OAuth)

| Método | Endpoint                | Descripción    | Auth |
| ------ | ----------------------- | -------------- | ---- |
| GET    | `/auth/google/redirect` | Iniciar OAuth  | No   |
| GET    | `/auth/google/callback` | Callback OAuth | No   |

---

## 🔐 Autenticación en Swagger

### Obtener Token

Usa cualquiera de estos endpoints:

- `POST /auth/register` → Crea cuenta y devuelve token
- `POST /auth/login` → Inicia sesión y devuelve token

### Autorizar Requests

1. Copia el valor del `token.value` (sin "Bearer")
2. Clic en **🔒 Authorize**
3. Pega el token en el campo `bearerAuth`
4. Clic en **Authorize**
5. Ahora puedes usar endpoints protegidos

---

## 📊 Códigos de Respuesta

| Código | Significado  | Cuándo ocurre                        |
| ------ | ------------ | ------------------------------------ |
| 200    | OK           | Operación exitosa                    |
| 201    | Created      | Usuario registrado exitosamente      |
| 400    | Bad Request  | Datos inválidos o validación fallida |
| 401    | Unauthorized | Token no proporcionado o inválido    |
| 403    | Forbidden    | Usuario inactivo o sin permisos      |
| 409    | Conflict     | Email ya registrado                  |

---

## 🔄 Flujo de Unificación de Cuentas (Google OAuth)

El sistema implementa unificación automática de cuentas:

### Escenario 1: Usuario Nuevo

1. Usuario hace clic en "Login con Google"
2. Autoriza la app en Google
3. Sistema crea nuevo usuario con `provider='google'`
4. Devuelve token JWT

### Escenario 2: Email Ya Existe (Registrado con Email/Password)

1. Usuario hace clic en "Login con Google"
2. Sistema detecta que el email ya existe
3. Vincula la cuenta de Google al usuario existente
4. Actualiza `provider='google'` y `provider_id`
5. Devuelve token JWT

### Escenario 3: Ya Autenticado con Google Previamente

1. Usuario hace clic en "Login con Google"
2. Sistema encuentra usuario por `provider_id`
3. Devuelve token JWT inmediatamente

---

## 🛠️ Personalización

### Cambiar Puerto del Servidor

Edita `.env`:

```env
PORT=3333
```

### Cambiar URL de Documentación

Edita `config/swagger.ts`:

```typescript
path: '/api-docs',  // Cambia de '/docs' a '/api-docs'
```

### Agregar Nuevos Endpoints

1. Agrega comentarios JSDoc en el controlador:

```typescript
/**
 * @miMetodo
 * @summary Título del endpoint
 * @description Descripción detallada
 * @tag Categoría
 * @requestBody <SchemaName>
 * @responseBody 200 - <ResponseSchema> - Descripción
 */
async miMetodo({ request, response }: HttpContext) {
  // implementación
}
```

2. Reinicia el servidor
3. Recarga `/docs`

---

## 📚 Documentación Adicional

- **Configuración Completa**: Ver `docs/swagger-setup.md`
- **Despliegue**: Ver `docs/despliegue-produccion.md`
- **Validadores**: Ver `app/validators/auth.ts`

---

## 🐛 Troubleshooting

### Swagger UI no carga

- Verifica que el servidor esté corriendo: `npm run dev`
- Confirma que las rutas estén registradas en `start/routes.ts`
- Revisa la consola por errores

### Esquemas no aparecen

- Verifica que los esquemas estén definidos en `config/swagger.ts`
- Asegúrate de usar la sintaxis correcta: `<SchemaName>`
- Reinicia el servidor

### Token no funciona

- Copia solo el valor del token (sin "Bearer")
- Verifica que el token no haya expirado (7 días)
- Asegúrate de hacer clic en "Authorize" después de pegar

---

## ✨ Características Implementadas

✅ **Documentación Completa**: Todos los endpoints documentados  
✅ **Esquemas Profesionales**: Request/Response schemas definidos  
✅ **Autenticación JWT**: Bearer token en Swagger UI  
✅ **Validación de Errores**: Todos los códigos de error documentados  
✅ **OAuth Google**: Flujo completo documentado  
✅ **Unificación de Cuentas**: Lógica explicada en docs  
✅ **Interfaz Interactiva**: Swagger UI totalmente funcional  
✅ **Ejemplos Realistas**: Datos de ejemplo en cada endpoint

---

## 🎉 ¡Listo para Usar!

La documentación Swagger está completamente implementada y lista para usar.

**Próximos pasos sugeridos:**

1. Probar todos los endpoints en Swagger UI
2. Revisar la documentación generada
3. Personalizar según necesidades del proyecto
4. Desplegar a producción con la configuración adecuada

**¿Preguntas?** Consulta `docs/swagger-setup.md` para más detalles.
