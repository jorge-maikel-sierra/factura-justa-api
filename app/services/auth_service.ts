import User from '#models/user'
import db from '@adonisjs/lucid/services/db'
import { AccessToken } from '@adonisjs/auth/access_tokens'

export interface DatosUsuarioSocial {
  email: string
  fullName?: string
  provider: string
  providerId: string
}

export default class AuthService {
  /**
   * Busca o crea un usuario usando autenticación social con lógica de unificación.
   * Implementa transacciones para garantizar atomicidad.
   *
   * Flujo:
   * 1. Buscar por provider + provider_id
   * 2. Si no existe, buscar por email
   * 3. Si existe por email, vincular cuenta social
   * 4. Si no existe, crear nuevo usuario
   */
  async buscarOCrearUsuarioSocial(datos: DatosUsuarioSocial): Promise<User> {
    return await db.transaction(async (trx) => {
      // 1. Buscar usuario por identificador social (provider + provider_id)
      let usuario = await User.query({ client: trx })
        .where('provider', datos.provider)
        .where('provider_id', datos.providerId)
        .first()

      if (usuario) {
        return usuario
      }

      // 2. Buscar usuario por email (para unificación de cuentas)
      usuario = await User.query({ client: trx }).where('email', datos.email).first()

      if (usuario) {
        // 3. Vincular cuenta social a usuario existente
        usuario.provider = datos.provider
        usuario.providerId = datos.providerId

        // Actualizar fullName si no existe y viene de Google
        if (!usuario.fullName && datos.fullName) {
          usuario.fullName = datos.fullName
        }

        await usuario.save()
        return usuario
      }

      // 4. Crear nuevo usuario con autenticación social
      usuario = await User.create(
        {
          email: datos.email,
          fullName: datos.fullName,
          provider: datos.provider,
          providerId: datos.providerId,
          isActive: true,
          password: null, // No necesita contraseña en auth social
        },
        { client: trx }
      )

      return usuario
    })
  }

  /**
   * Genera un token de acceso para el usuario
   */
  async generarTokenAcceso(usuario: User): Promise<AccessToken> {
    return await User.accessTokens.create(usuario, ['*'], {
      name: 'auth_token',
      expiresIn: '7 days',
    })
  }
}
