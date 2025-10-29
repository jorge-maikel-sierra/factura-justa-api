import type { HttpContext } from '@adonisjs/core/http'
import AuthService from '#services/auth_service'
import Env from '#start/env'

export default class GoogleAuthController {
  private authService = new AuthService()

  async redirect({ ally }: HttpContext) {
    return ally.use('google').redirect()
  }

  async callback({ ally, response }: HttpContext) {
    const google = ally.use('google')
    const frontendUrl = Env.get('FRONTEND_URL', 'http://localhost:3000') // URL base del frontend

    try {
      const googleUser = await google.user()

      if (!googleUser.email) {
        return response.redirect(`${frontendUrl}/login?error=email_not_provided`)
      }

      const usuario = await this.authService.buscarOCrearUsuarioSocial({
        email: googleUser.email,
        fullName: googleUser.name,
        provider: 'google',
        providerId: googleUser.id,
      })

      if (!usuario.isActive) {
        return response.redirect(`${frontendUrl}/login?error=user_inactive`)
      }

      const token = await this.authService.generarTokenAcceso(usuario)
      const tokenValue = token.value!.release()

      // Redirigir al frontend con el token en la URL
      return response.redirect(`${frontendUrl}/auth/callback?token=${tokenValue}`)
    } catch (error) {
      // Redirigir al frontend con un mensaje de error genérico
      return response.redirect(`${frontendUrl}/login?error=google_auth_failed`)
    }
  }
}
