# Documentación Swagger/OpenAPI - Factura Justa API

## 📋 Resumen

Este documento describe la implementación completa de documentación API usando **adonis-autoswagger** en el proyecto Factura Justa API.

## 🚀 Instalación y Configuración

### 1. Instalación del Paquete

El paquete **adonis-autoswagger** ya está instalado en el proyecto:

```bash
npm install adonis-autoswagger  # Ya instalado en package.json
```

### 2. Configuración Inicial

El archivo `config/swagger.ts` contiene la configuración completa con esquemas profesionales:

```typescript
export default {
  path: '/docs', // Ruta de la interfaz Swagger UI
  exclude: ['/swagger', '/docs'], // Rutas excluidas de la documentación
  tagIndex: 3, // Índice del tag en comentarios JSDoc
  ignore: ['/'], // Rutas ignoradas
  snakeCase: false, // No convertir a snake_case

  swagger: {
    enabled: true,
    uiEnabled: true,
    uiUrl: 'docs',
    specEnabled: true,
    specUrl: '/swagger.json',

    options: {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'Factura Justa API',
          version: '1.0.0',
          description: 'API REST con autenticación tradicional y OAuth',
        },
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
        },
      },
    },
  },
}
```

### 3. Rutas de Swagger

En `start/routes.ts`:

```typescript
import AutoSwagger from 'adonis-autoswagger'
import swagger from '#config/swagger'

// Endpoint para spec JSON
router.get('/swagger', async () => {
  return AutoSwagger.default.docs(router.toJSON(), swagger)
})

// Endpoint para Swagger UI
router.get('/docs', async () => {
  return AutoSwagger.default.ui('/swagger', swagger)
})
```

## 📝 Formato de Documentación en Controladores

### Sintaxis de Comentarios JSDoc

```typescript
/**
 * @nombreMetodo
 * @summary Título corto del endpoint
 * @description Descripción detallada del funcionamiento
 * @tag Nombre del Tag (ej: Autenticación)
 * @requestBody {"campo": "ejemplo"} - Descripción del body
 * @responseBody 200 - {"respuesta": "ejemplo"}
 * @responseBody 400 - {"error": "ejemplo"}
 * @security bearerAuth
 */
async metodo({ request, response }: HttpContext) {
  // implementación
}
```

## 🔐 Endpoints Documentados

### 1. POST /auth/register

**Descripción**: Registro de nuevo usuario con autenticación tradicional

**Request Body**:

```json
{
  "email": "usuario@example.com",
  "password": "contraseña123",
  "fullName": "Nombre Completo"
}
```

**Respuestas**:

- **201 Created**: Usuario registrado exitosamente

```json
{
  "mensaje": "Usuario registrado exitosamente",
  "usuario": {
    "id": 1,
    "email": "usuario@example.com",
    "fullName": "Nombre Completo"
  },
  "token": {
    "type": "bearer",
    "value": "eyJhbGciOiJI...",
    "expiresAt": "2025-11-04T16:00:00.000Z"
  }
}
```

- **400 Bad Request**: Errores de validación

```json
{
  "errors": [
    {
      "field": "email",
      "message": "El email es inválido"
    }
  ]
}
```

- **409 Conflict**: Email ya registrado

```json
{
  "mensaje": "El correo electrónico ya está registrado"
}
```

### 2. POST /auth/login

**Descripción**: Inicio de sesión con credenciales tradicionales

**Request Body**:

```json
{
  "email": "usuario@example.com",
  "password": "contraseña123"
}
```

**Respuestas**:

- **200 OK**: Login exitoso

```json
{
  "mensaje": "Inicio de sesión exitoso",
  "usuario": {
    "id": 1,
    "email": "usuario@example.com",
    "fullName": "Nombre Completo",
    "provider": "local"
  },
  "token": {
    "type": "bearer",
    "value": "eyJhbGciOiJI...",
    "expiresAt": "2025-11-04T16:00:00.000Z"
  }
}
```

- **400 Bad Request**: Credenciales inválidas
- **403 Forbidden**: Usuario inactivo

### 3. POST /auth/logout

**Descripción**: Cierra la sesión del usuario actual

**Seguridad**: Requiere Bearer Token

**Headers**:

```
Authorization: Bearer eyJhbGciOiJI...
```

**Respuestas**:

- **200 OK**: Sesión cerrada

```json
{
  "mensaje": "Sesión cerrada exitosamente"
}
```

- **401 Unauthorized**: Token no proporcionado o inválido

### 4. GET /auth/me

**Descripción**: Obtiene información del usuario autenticado

**Seguridad**: Requiere Bearer Token

**Respuestas**:

- **200 OK**: Información del usuario

```json
{
  "usuario": {
    "id": 1,
    "email": "usuario@example.com",
    "fullName": "Nombre Completo",
    "provider": "local",
    "isActive": true,
    "createdAt": "2025-10-28T16:00:00.000Z"
  }
}
```

### 5. GET /auth/google/redirect

**Descripción**: Inicia el flujo de autenticación con Google OAuth

**Respuestas**:

- **302 Found**: Redirección a Google OAuth

### 6. GET /auth/google/callback

**Descripción**: Callback de Google OAuth con lógica de unificación de cuentas

**Query Parameters**:

- `code`: Código de autorización (proporcionado por Google)
- `state`: Estado de OAuth (proporcionado por Google)

**Flujo de Unificación**:

1. Buscar usuario por `provider='google'` y `provider_id=[sub]`
2. Si no existe, buscar por `email`
3. Si existe por email, vincular cuenta de Google
4. Si no existe, crear nuevo usuario

**Respuestas**:

- **200 OK**: Autenticación exitosa

```json
{
  "mensaje": "Autenticación con Google exitosa",
  "usuario": {
    "id": 1,
    "email": "usuario@gmail.com",
    "fullName": "Usuario Google",
    "provider": "google"
  },
  "token": {
    "type": "bearer",
    "value": "eyJhbGciOiJI...",
    "expiresAt": "2025-11-04T16:00:00.000Z"
  }
}
```

- **400 Bad Request**: Google no proporcionó email
- **403 Forbidden**: Usuario inactivo

## 🔑 Autenticación en Swagger UI

### Probar Endpoints Protegidos

1. Obtén un token registrándote o iniciando sesión
2. Copia el valor del token (sin "Bearer")
3. En Swagger UI, haz clic en el botón **Authorize** 🔒
4. Pega el token en el campo `bearerAuth`
5. Haz clic en **Authorize** y cierra el modal
6. Ahora puedes probar endpoints protegidos

## 🌐 Acceso a la Documentación

### URLs Disponibles

- **Swagger UI (Interfaz Visual)**: http://localhost:3333/docs
- **Especificación JSON**: http://localhost:3333/swagger
- **API Base**: http://localhost:3333

### En Producción

Actualiza las URLs en `config/swagger.ts`:

```typescript
servers: [
  {
    url: 'https://api.facturajusta.com',
    description: 'Servidor de Producción',
  },
]
```

## 📊 Schemas y Validaciones

### Validadores (VineJS)

Los validadores en `app/validators/auth.ts` definen las reglas:

```typescript
export const registroValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email().normalizeEmail(),
    password: vine.string().minLength(8),
    fullName: vine.string().trim().minLength(2).optional(),
  })
)

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email().normalizeEmail(),
    password: vine.string().minLength(1),
  })
)
```

### Esquemas OpenAPI Definidos

La configuración de Swagger incluye los siguientes esquemas profesionales en `config/swagger.ts`:

#### Esquemas de Request

1. **RegisterRequest**: Datos para registro de usuario
   - `email` (string, required): Email válido
   - `password` (string, required): Mínimo 8 caracteres
   - `fullName` (string, optional): Nombre completo

2. **LoginRequest**: Credenciales de inicio de sesión
   - `email` (string, required): Email del usuario
   - `password` (string, required): Contraseña

#### Esquemas de Response

1. **UserObject**: Información del usuario
   - `id`, `email`, `fullName`, `provider`, `isActive`, `createdAt`

2. **TokenObject**: Token JWT
   - `type`: "bearer"
   - `value`: Token JWT
   - `expiresAt`: Fecha de expiración (7 días)

3. **RegisterResponse**: Respuesta de registro exitoso
4. **LoginResponse**: Respuesta de login exitoso
5. **LogoutResponse**: Confirmación de cierre de sesión
6. **MeResponse**: Información del usuario autenticado
7. **GoogleAuthResponse**: Respuesta de autenticación con Google

#### Esquemas de Error

1. **ValidationError**: Errores de validación (400)
2. **UnauthorizedError**: Token inválido o no proporcionado (401)
3. **ForbiddenError**: Usuario inactivo o sin permisos (403)
4. **ConflictError**: Email ya registrado (409)
5. **GoogleAuthError**: Errores en flujo OAuth

### Uso de Esquemas en Controladores

Los controladores usan referencias a esquemas con la sintaxis `<SchemaName>`:

```typescript
/**
 * @registro
 * @summary Registro de nuevo usuario
 * @description Descripción detallada...
 * @tag Autenticación
 * @requestBody <RegisterRequest>
 * @responseBody 201 - <RegisterResponse> - Usuario creado exitosamente
 * @responseBody 400 - <ValidationError> - Validación fallida
 * @responseBody 409 - <ConflictError> - Email ya registrado
 */
```

## 🧪 Pruebas con Swagger UI

### Flujo Completo de Prueba

1. **Registrar usuario**:
   - Endpoint: `POST /auth/register`
   - Body: email, password, fullName
   - Copiar token de la respuesta

2. **Autorizar en Swagger**:
   - Clic en 🔒 Authorize
   - Pegar token
   - Confirmar

3. **Probar endpoint protegido**:
   - `GET /auth/me`
   - Debería devolver información del usuario

4. **Cerrar sesión**:
   - `POST /auth/logout`
   - El token queda invalidado

## 🔧 Mantenimiento

### Actualizar Documentación

1. Modifica los comentarios JSDoc en los controladores
2. Reinicia el servidor: `npm run dev`
3. Recarga `/docs` en el navegador

### Generar Spec JSON Estático

Para producción, puedes generar el JSON una vez:

```typescript
// En config/swagger.ts
mode: 'PRODUCTION'
```

## 📚 Referencias

- [adonis-autoswagger](https://github.com/ad-on-is/adonis-autoswagger)
- [OpenAPI 3.0 Specification](https://swagger.io/specification/)
- [AdonisJS Documentation](https://docs.adonisjs.com)
