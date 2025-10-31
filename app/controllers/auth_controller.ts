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
   */
  async registro({ request, response }: HttpContext) {
    const datos = await request.validateUsing(registroValidator)

    // Verificar si el email ya existe
    const usuarioExistente = await User.findBy('email', datos.email)
    if (usuarioExistente) {
      return response.conflict({
        mensaje: 'El correo electrónico ya está registrado',
      })
    }

    // Crear usuario con provider 'local'
    const usuario = await User.create({
      email: datos.email,
      password: datos.password,
      fullName: datos.fullName,
      provider: 'local',
      providerId: null,
      isActive: true,
    })

    // Generar token de acceso
    const token = await this.authService.generarTokenAcceso(usuario)

    return response.created({
      mensaje: 'Usuario registrado exitosamente',
      usuario: {
        id: usuario.id,
        email: usuario.email,
        fullName: usuario.fullName,
      },
      token: {
        type: 'bearer',
        value: token.value!.release(),
        expiresAt: token.expiresAt,
      },
    })
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
   */
  async login({ request, response }: HttpContext) {
    try {
      const datos = await request.validateUsing(loginValidator)

      // Ahora intentar verificar credenciales
      const usuario = await User.verifyCredentials(datos.email, datos.password)

      // Generar token de acceso
      const token = await this.authService.generarTokenAcceso(usuario)

      return response.ok({
        mensaje: 'Inicio de sesión exitoso',
        usuario: {
          id: usuario.id,
          email: usuario.email,
          fullName: usuario.fullName,
          provider: usuario.provider,
        },
        token: {
          type: 'bearer',
          value: token.value!.release(),
          expiresAt: token.expiresAt,
        },
      })
    } catch (error) {
      if (error.code === 'E_INVALID_CREDENTIALS') {
        return response.badRequest({
          errors: [{ message: 'Invalid user credentials' }],
        })
      }

      throw error
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
   */
  async logout({ auth, response }: HttpContext) {
    const usuario = auth.getUserOrFail()
    const token = auth.user?.currentAccessToken

    if (token) {
      await User.accessTokens.delete(usuario, token.identifier)
    }

    return response.ok({
      mensaje: 'Sesión cerrada exitosamente',
    })
  }

  /**
   * @me
   * @summary Obtener usuario actual
   * @description Devuelve la información completa del usuario autenticado. Requiere autenticación.
   * @tag Autenticación
   * @security bearerAuth
   * @responseBody 200 - <MeResponse> - Información del usuario autenticado
   * @responseBody 401 - <UnauthorizedError> - Token no proporcionado o inválido
   */
  async me({ auth, response }: HttpContext) {
    const usuario = auth.getUserOrFail()

    return response.ok({
      usuario: {
        id: usuario.id,
        email: usuario.email,
        fullName: usuario.fullName,
        provider: usuario.provider,
        isActive: usuario.isActive,
        createdAt: usuario.createdAt,
      },
    })
  }
}
