import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { loginValidator, registroValidator } from '#validators/auth'
import AuthService from '#services/auth_service'

export default class AuthController {
  private authService = new AuthService()

  /**
   * @registro
   * @summary Registro de nuevo usuario
   * @description Registra un nuevo usuario con autenticación tradicional usando email y contraseña. La contraseña se hashea automáticamente antes de almacenarse. Devuelve un token JWT válido por 7 días.
   * @tag Autenticación
   * @requestBody <RegisterRequest>
   * @responseBody 201 - <RegisterResponse> - Usuario creado y sesión iniciada
   * @responseBody 400 - <ValidationError> - Validación fallida (email inválido, contraseña muy corta, etc.)
   * @responseBody 409 - <ConflictError> - El email ya está registrado
   * @responseBody 500 - <ServerError> - Error interno del servidor
   */
  async registro({ request, response }: HttpContext) {
    try {
      // 1. Validar datos de entrada
      const datos = await request.validateUsing(registroValidator)

      // 2. Verificar si el email ya existe
      const usuarioExistente = await User.findBy('email', datos.email)
      if (usuarioExistente) {
        return response.conflict({
          estado: 'ERROR',
          mensaje: 'El correo electrónico ya está registrado',
        })
      }

      // 3. Hashear la contraseña manualmente
      const hash = await import('@adonisjs/core/services/hash')
      const passwordHasheada = await hash.default.make(datos.password)

      // 4. Crear usuario con provider 'local'
      const usuario = await User.create({
        email: datos.email,
        password: passwordHasheada, // ← Contraseña ya hasheada
        fullName: datos.fullName,
        provider: 'local',
        providerId: null,
        isActive: true,
      })

      // 4. Generar token de acceso
      const token = await this.authService.generarTokenAcceso(usuario)

      // 5. Responder con código 201 (Created) y estructura consistente
      return response.created({
        estado: 'OK',
        mensaje: 'Usuario registrado exitosamente',
        datos: {
          usuario: {
            id: usuario.id,
            email: usuario.email,
            fullName: usuario.fullName,
            provider: usuario.provider,
          },
          token: {
            tipo: 'bearer',
            valor: token.value!.release(),
            expiraEn: token.expiresAt,
          },
        },
      })
    } catch (error) {
      // Manejo centralizado de errores
      console.error('✗ ERROR EN REGISTRO:')
      console.error('  Tipo:', error.constructor.name)
      console.error('  Mensaje:', error.message)

      // Responder con código de error apropiado
      return response.status(error?.status || 500).send({
        estado: 'ERROR',
        mensaje: error?.message || 'Error interno del servidor',
        datos: {
          error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        },
      })
    }
  }

  /**
   * @login
   * @summary Iniciar sesión
   * @description Autentica a un usuario existente usando email y contraseña. Devuelve un token JWT válido por 7 días.
   * @tag Autenticación
   * @requestBody <LoginRequest>
   * @responseBody 200 - <LoginResponse> - Inicio de sesión exitoso
   * @responseBody 400 - <ValidationError> - Credenciales inválidas o datos incorrectos
   * @responseBody 403 - <ForbiddenError> - Usuario inactivo o sin permisos
   * @responseBody 500 - <ServerError> - Error interno del servidor
   */
  async login({ request, response }: HttpContext) {
    try {
      // 1. Validar datos de entrada
      const datos = await request.validateUsing(loginValidator)

      // 2. Verificar credenciales
      const usuario = await User.verifyCredentials(datos.email, datos.password)

      // 3. Verificar que el usuario esté activo
      if (!usuario.isActive) {
        return response.forbidden({
          estado: 'ERROR',
          mensaje: 'Usuario inactivo. Contacte al administrador.',
          datos: null,
        })
      }

      // 4. Generar token de acceso
      const token = await this.authService.generarTokenAcceso(usuario)

      // 5. Responder con estructura consistente
      return response.ok({
        estado: 'OK',
        mensaje: 'Inicio de sesión exitoso',
        datos: {
          usuario: {
            id: usuario.id,
            email: usuario.email,
            fullName: usuario.fullName,
            provider: usuario.provider,
          },
          token: {
            tipo: 'bearer',
            valor: token.value!.release(),
            expiraEn: token.expiresAt,
          },
        },
      })
    } catch (error) {
      console.error('✗ ERROR EN LOGIN:')
      console.error('  Tipo:', error.constructor.name)
      console.error('  Mensaje:', error.message)

      // Manejo específico de error de credenciales inválidas
      if (error.code === 'E_INVALID_CREDENTIALS') {
        return response.badRequest({
          estado: 'ERROR',
          mensaje: 'Credenciales inválidas',
          datos: {
            error: 'El email o la contraseña son incorrectos',
          },
        })
      }

      // Otros errores
      return response.status(error?.status || 500).send({
        estado: 'ERROR',
        mensaje: 'Error al procesar la solicitud',
        datos: {
          error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        },
      })
    }
  }

  /**
   * @logout
   * @summary Cerrar sesión
   * @description Cierra la sesión del usuario actual invalidando su token de acceso. Requiere autenticación.
   * @tag Autenticación
   * @security bearerAuth
   * @responseBody 200 - <LogoutResponse> - Sesión cerrada exitosamente
   * @responseBody 401 - <UnauthorizedError> - Token no proporcionado o inválido
   * @responseBody 500 - <ServerError> - Error interno del servidor
   */
  async logout({ auth, response }: HttpContext) {
    try {
      // 1. Obtener usuario autenticado
      const usuario = auth.getUserOrFail()
      const token = auth.user?.currentAccessToken

      // 2. Invalidar token si existe
      if (token) {
        await User.accessTokens.delete(usuario, token.identifier)
      }

      // 3. Responder con código 200 y estructura consistente
      return response.ok({
        estado: 'OK',
        mensaje: 'Sesión cerrada exitosamente',
        datos: null,
      })
    } catch (error) {
      console.error('✗ ERROR EN LOGOUT:')
      console.error('  Tipo:', error.constructor.name)
      console.error('  Mensaje:', error.message)

      // Manejo de error de autenticación
      if (error.code === 'E_UNAUTHORIZED_ACCESS') {
        return response.unauthorized({
          estado: 'ERROR',
          mensaje: 'No autenticado',
          datos: {
            error: 'Token no proporcionado o inválido',
          },
        })
      }

      // Otros errores
      return response.status(error?.status || 500).send({
        estado: 'ERROR',
        mensaje: 'Error al cerrar sesión',
        datos: {
          error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        },
      })
    }
  }

  /**
   * @me
   * @summary Obtener usuario actual
   * @description Devuelve la información completa del usuario autenticado. Requiere autenticación.
   * @tag Autenticación
   * @security bearerAuth
   * @responseBody 200 - <MeResponse> - Información del usuario autenticado
   * @responseBody 401 - <UnauthorizedError> - Token no proporcionado o inválido
   * @responseBody 500 - <ServerError> - Error interno del servidor
   */
  async me({ auth, response }: HttpContext) {
    try {
      // 1. Obtener usuario autenticado
      const usuario = auth.getUserOrFail()

      // 2. Responder con estructura consistente
      return response.ok({
        estado: 'OK',
        mensaje: 'Usuario obtenido exitosamente',
        datos: {
          usuario: {
            id: usuario.id,
            email: usuario.email,
            fullName: usuario.fullName,
            provider: usuario.provider,
            isActive: usuario.isActive,
            creadoEn: usuario.createdAt,
            actualizadoEn: usuario.updatedAt,
          },
        },
      })
    } catch (error) {
      console.error('✗ ERROR EN ME:')
      console.error('  Tipo:', error.constructor.name)
      console.error('  Mensaje:', error.message)

      // Manejo de error de autenticación
      if (error.code === 'E_UNAUTHORIZED_ACCESS') {
        return response.unauthorized({
          estado: 'ERROR',
          mensaje: 'No autenticado',
          datos: {
            error: 'Token no proporcionado o inválido',
          },
        })
      }

      // Otros errores
      return response.status(error?.status || 500).send({
        estado: 'ERROR',
        mensaje: 'Error al obtener información del usuario',
        datos: {
          error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        },
      })
    }
  }
}
