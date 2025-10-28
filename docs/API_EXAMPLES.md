# 📖 Ejemplos de Uso de la API

Esta guía proporciona ejemplos prácticos de cómo consumir la API de Factura Justa usando diferentes herramientas.

---

## 🔧 Herramientas Recomendadas

- **Swagger UI**: http://localhost:3333/docs (Interfaz interactiva)
- **cURL**: Línea de comandos
- **Postman**: Cliente API visual
- **HTTPie**: Cliente HTTP amigable
- **Fetch API**: JavaScript/TypeScript

---

## 🚀 Ejemplos con cURL

### 1. Registro de Usuario

```bash
curl -X POST http://localhost:3333/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "password": "MiPassword123!",
    "fullName": "Juan Pérez"
  }'
```

**Respuesta (201 Created)**:

```json
{
  "mensaje": "Usuario registrado exitosamente",
  "usuario": {
    "id": 1,
    "email": "usuario@example.com",
    "fullName": "Juan Pérez"
  },
  "token": {
    "type": "bearer",
    "value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": "2025-11-04T16:00:00.000Z"
  }
}
```

### 2. Inicio de Sesión

```bash
curl -X POST http://localhost:3333/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "password": "MiPassword123!"
  }'
```

**Respuesta (200 OK)**:

```json
{
  "mensaje": "Inicio de sesión exitoso",
  "usuario": {
    "id": 1,
    "email": "usuario@example.com",
    "fullName": "Juan Pérez",
    "provider": "local"
  },
  "token": {
    "type": "bearer",
    "value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": "2025-11-04T16:00:00.000Z"
  }
}
```

### 3. Obtener Perfil (Requiere Autenticación)

```bash
# Guarda el token en una variable
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET http://localhost:3333/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

**Respuesta (200 OK)**:

```json
{
  "usuario": {
    "id": 1,
    "email": "usuario@example.com",
    "fullName": "Juan Pérez",
    "provider": "local",
    "isActive": true,
    "createdAt": "2025-10-28T16:00:00.000Z"
  }
}
```

### 4. Cerrar Sesión

```bash
curl -X POST http://localhost:3333/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

**Respuesta (200 OK)**:

```json
{
  "mensaje": "Sesión cerrada exitosamente"
}
```

---

## 🌐 Ejemplos con JavaScript/TypeScript (Fetch API)

### Cliente API Básico

```typescript
// api-client.ts
const API_BASE_URL = 'http://localhost:3333'

interface AuthResponse {
  mensaje: string
  usuario: {
    id: number
    email: string
    fullName: string
    provider: string
  }
  token: {
    type: string
    value: string
    expiresAt: string
  }
}

class FacturaJustaAPI {
  private token: string | null = null

  async register(email: string, password: string, fullName?: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, fullName }),
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${await response.text()}`)
    }

    const data = await response.json()
    this.token = data.token.value
    return data
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${await response.text()}`)
    }

    const data = await response.json()
    this.token = data.token.value
    return data
  }

  async getProfile() {
    if (!this.token) {
      throw new Error('No autenticado. Llama a login() o register() primero.')
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${await response.text()}`)
    }

    return response.json()
  }

  async logout() {
    if (!this.token) {
      throw new Error('No autenticado.')
    }

    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${await response.text()}`)
    }

    const data = await response.json()
    this.token = null
    return data
  }

  setToken(token: string) {
    this.token = token
  }

  getToken(): string | null {
    return this.token
  }
}

export default FacturaJustaAPI
```

### Uso del Cliente

```typescript
// ejemplo-uso.ts
import FacturaJustaAPI from './api-client'

async function ejemploCompleto() {
  const api = new FacturaJustaAPI()

  try {
    // 1. Registrar nuevo usuario
    console.log('Registrando usuario...')
    const registro = await api.register('test@example.com', 'Password123!', 'Usuario de Prueba')
    console.log('✓ Usuario registrado:', registro.usuario)
    console.log('✓ Token obtenido:', registro.token.value.substring(0, 20) + '...')

    // 2. Obtener perfil
    console.log('\nObteniendo perfil...')
    const perfil = await api.getProfile()
    console.log('✓ Perfil:', perfil.usuario)

    // 3. Cerrar sesión
    console.log('\nCerrando sesión...')
    const logout = await api.logout()
    console.log('✓', logout.mensaje)

    // 4. Iniciar sesión nuevamente
    console.log('\nIniciando sesión...')
    const login = await api.login('test@example.com', 'Password123!')
    console.log('✓ Login exitoso:', login.usuario)
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

ejemploCompleto()
```

---

## 🔴 Ejemplos con HTTPie

HTTPie es una herramienta CLI más amigable que cURL.

### Instalación

```bash
# macOS
brew install httpie

# Linux
sudo apt install httpie

# Python
pip install httpie
```

### Ejemplos

```bash
# Registro
http POST localhost:3333/auth/register \
  email=usuario@example.com \
  password=Password123! \
  fullName="Juan Pérez"

# Login
http POST localhost:3333/auth/login \
  email=usuario@example.com \
  password=Password123!

# Perfil (con token)
http GET localhost:3333/auth/me \
  Authorization:"Bearer eyJhbGciOiJI..."

# Logout
http POST localhost:3333/auth/logout \
  Authorization:"Bearer eyJhbGciOiJI..."
```

---

## 🎨 Ejemplos con Vue 3 + Quasar

### Composable de Autenticación

```typescript
// composables/useAuth.ts
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333'

interface User {
  id: number
  email: string
  fullName: string
  provider: string
  isActive: boolean
  createdAt: string
}

interface AuthToken {
  type: string
  value: string
  expiresAt: string
}

export function useAuth() {
  const $q = useQuasar()
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const isAuthenticated = computed(() => !!token.value)

  async function register(email: string, password: string, fullName?: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.mensaje || 'Error en el registro')
      }

      const data = await response.json()
      token.value = data.token.value
      user.value = data.usuario
      localStorage.setItem('auth_token', data.token.value)

      $q.notify({
        type: 'positive',
        message: 'Usuario registrado exitosamente',
        icon: 'check_circle',
      })

      return data
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: error.message,
        icon: 'error',
      })
      throw error
    }
  }

  async function login(email: string, password: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.mensaje || 'Credenciales inválidas')
      }

      const data = await response.json()
      token.value = data.token.value
      user.value = data.usuario
      localStorage.setItem('auth_token', data.token.value)

      $q.notify({
        type: 'positive',
        message: 'Inicio de sesión exitoso',
        icon: 'check_circle',
      })

      return data
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: error.message,
        icon: 'error',
      })
      throw error
    }
  }

  async function logout() {
    try {
      if (token.value) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token.value}` },
        })
      }

      token.value = null
      user.value = null
      localStorage.removeItem('auth_token')

      $q.notify({
        type: 'info',
        message: 'Sesión cerrada',
        icon: 'logout',
      })
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  async function fetchProfile() {
    if (!token.value) return

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token.value}` },
      })

      if (!response.ok) {
        throw new Error('Token inválido')
      }

      const data = await response.json()
      user.value = data.usuario
    } catch (error) {
      console.error('Error al obtener perfil:', error)
      await logout()
    }
  }

  async function loginWithGoogle() {
    // Redirigir a Google OAuth
    window.location.href = `${API_BASE_URL}/auth/google/redirect`
  }

  return {
    user,
    token,
    isAuthenticated,
    register,
    login,
    logout,
    fetchProfile,
    loginWithGoogle,
  }
}
```

### Componente de Login

```vue
<!-- components/LoginForm.vue -->
<template>
  <q-card class="q-pa-md" style="max-width: 400px">
    <q-card-section>
      <div class="text-h6">Iniciar Sesión</div>
    </q-card-section>

    <q-card-section>
      <q-form @submit="onSubmit">
        <q-input
          v-model="email"
          label="Email"
          type="email"
          outlined
          :rules="[(val) => !!val || 'Email requerido']"
        />

        <q-input
          v-model="password"
          label="Contraseña"
          type="password"
          outlined
          class="q-mt-md"
          :rules="[(val) => !!val || 'Contraseña requerida']"
        />

        <q-btn
          type="submit"
          label="Iniciar Sesión"
          color="primary"
          class="full-width q-mt-md"
          :loading="loading"
        />

        <q-separator class="q-my-md" />

        <q-btn
          label="Continuar con Google"
          color="white"
          text-color="black"
          icon="img:https://www.google.com/favicon.ico"
          class="full-width"
          @click="loginWithGoogle"
        />
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useRouter } from 'vue-router'

const router = useRouter()
const { login, loginWithGoogle } = useAuth()

const email = ref('')
const password = ref('')
const loading = ref(false)

async function onSubmit() {
  loading.value = true
  try {
    await login(email.value, password.value)
    router.push('/dashboard')
  } catch (error) {
    // Error manejado en el composable
  } finally {
    loading.value = false
  }
}
</script>
```

---

## ❌ Manejo de Errores

### Errores Comunes y Soluciones

#### Error 400 - Validación Fallida

```json
{
  "errors": [
    {
      "field": "email",
      "message": "El email es inválido",
      "rule": "email"
    }
  ]
}
```

**Solución**: Verifica que el email tenga formato válido y la contraseña tenga mínimo 8 caracteres.

#### Error 401 - No Autorizado

```json
{
  "errors": [
    {
      "message": "Token de autenticación no proporcionado"
    }
  ]
}
```

**Solución**: Incluye el header `Authorization: Bearer {token}` en la petición.

#### Error 403 - Usuario Inactivo

```json
{
  "mensaje": "Usuario inactivo"
}
```

**Solución**: Contacta al administrador para activar la cuenta.

#### Error 409 - Email Duplicado

```json
{
  "mensaje": "El correo electrónico ya está registrado"
}
```

**Solución**: Usa un email diferente o inicia sesión con el email existente.

---

## 🔐 Mejores Prácticas

### Almacenamiento de Tokens

✅ **Recomendado**:

- Almacenar en `localStorage` para aplicaciones web
- Almacenar en `SecureStore` para aplicaciones móviles
- Incluir fecha de expiración

❌ **No Recomendado**:

- Almacenar en cookies sin `httpOnly`
- Almacenar en variables globales
- Compartir tokens entre usuarios

### Renovación de Tokens

Los tokens expiran en 7 días. Implementa lógica para:

1. Verificar expiración antes de cada request
2. Redirigir a login si el token expiró
3. Mostrar advertencia antes de expiración

### Seguridad

- Siempre usa HTTPS en producción
- No expongas tokens en URLs
- Implementa rate limiting
- Valida datos en el cliente antes de enviar

---

## 📚 Recursos Adicionales

- **Swagger UI**: http://localhost:3333/docs
- **Documentación Completa**: `docs/swagger-setup.md`
- **Guía Rápida**: `docs/SWAGGER_QUICK_START.md`
- **Implementación**: `docs/SWAGGER_IMPLEMENTATION.md`

---

**¿Necesitas más ejemplos?** Consulta la documentación interactiva en Swagger UI.
