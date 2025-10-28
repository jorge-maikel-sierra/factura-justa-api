import type { HttpContext } from '@adonisjs/core/http'
import AuthService from '#services/auth_service'

export default class GoogleAuthController {
  private authService = new AuthService()

  /**
   * @redirect
   * @summary Iniciar autenticación con Google
   * @description Redirige al usuario a la página de autenticación de Google OAuth 2.0. El usuario debe autorizar la aplicación para acceder a su email y perfil. Después de la autorización, Google redirigirá al usuario al endpoint de callback.
   * @tag Autenticación
   * @responseBody 302 - Redirección a Google OAuth (no requiere body)
   */
  async redirect({ ally }: HttpContext) {
    return ally.use('google').redirect()
  }

  /**
   * @callback
   * @summary Callback de Google OAuth
   * @description Procesa la respuesta de Google OAuth y realiza la unificación de cuentas. Si el email ya existe en el sistema (registrado con email/password), vincula la cuenta de Google al usuario existente. Si no existe, crea un nuevo usuario con provider 'google'. Devuelve un token JWT válido por 7 días.
   * @tag Autenticación
   * @paramQuery code - string - Código de autorización de Google (proporcionado automáticamente) - required
   * @paramQuery state - string - Estado de OAuth para prevenir CSRF (proporcionado automáticamente) - required
   * @responseBody 200 - <GoogleAuthResponse> - Autenticación con Google exitosa
   * @responseBody 400 - <GoogleAuthError> - Error en el flujo OAuth (email no proporcionado, usuario canceló, etc.)
   * @responseBody 403 - <ForbiddenError> - Usuario inactivo o sin permisos
   */
  async callback({ ally, response }: HttpContext) {
    const google = ally.use('google')

    try {
      const googleUser = await google.user()

      // Validar que Google provea un email
      if (!googleUser.email) {
        return response.badRequest({
          mensaje: 'Google no proporcionó un email. Verifica los permisos de la aplicación.',
        })
      }

      // Buscar o crear usuario con lógica de unificación
      const usuario = await this.authService.buscarOCrearUsuarioSocial({
        email: googleUser.email,
        fullName: googleUser.name,
        provider: 'google',
        providerId: googleUser.id, // El 'sub' de Google
      })

      // Verificar que el usuario esté activo
      if (!usuario.isActive) {
        return response.forbidden({
          mensaje: 'Usuario inactivo',
        })
      }

      // Generar token de acceso
      const token = await this.authService.generarTokenAcceso(usuario)

      return response.ok({
        mensaje: 'Autenticación con Google exitosa',
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
      /**
       * Manejo de errores de OAuth:
       * - Usuario cancela el flujo
       * - Token inválido
       * - Errores de red con Google
       */
      return response.badRequest({
        mensaje: 'Error en la autenticación con Google',
        error: error.message,
      })
    }
  }
}
