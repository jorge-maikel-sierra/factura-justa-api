import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'

/**
 * AuthFinder mixin configuration
 * Configura el método de hash (scrypt) y el campo para autenticación (email)
 */
const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

/**
 * Modelo User
 * Representa a los usuarios del sistema con autenticación tradicional y OAuth
 */
export default class User extends compose(BaseModel, AuthFinder) {
  /**
   * ID único del usuario (clave primaria)
   */
  @column({ isPrimary: true })
  declare id: number

  /**
   * Nombre completo del usuario
   */
  @column()
  declare fullName: string | null

  /**
   * Email del usuario (usado para autenticación)
   */
  @column()
  declare email: string

  /**
   * Contraseña hasheada del usuario
   * - No se serializa en respuestas JSON
   * - Puede ser null para usuarios de OAuth que no tienen contraseña
   */
  @column({ serializeAs: null })
  declare password: string | null

  /**
   * Proveedor de autenticación
   * Valores posibles: 'local', 'google', 'facebook', etc.
   */
  @column()
  declare provider: string

  /**
   * ID del usuario en el proveedor externo (OAuth)
   * Null para usuarios con autenticación local
   */
  @column()
  declare providerId: string | null

  /**
   * Estado de activación del usuario
   * - true: usuario puede iniciar sesión
   * - false: usuario bloqueado
   */
  @column()
  declare isActive: boolean

  /**
   * Fecha y hora de creación del usuario
   */
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  /**
   * Fecha y hora de última actualización
   */
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  /**
   * Provider para tokens de acceso
   * Permite generar y validar tokens JWT para autenticación
   */
  static accessTokens = DbAccessTokensProvider.forModel(User)

  /**
   * NO usamos @beforeSave() para hashear contraseñas
   *
   * IMPORTANTE: El AuthFinder ya maneja la verificación de contraseñas
   * con verifyCredentials(). Hashear aquí causaría doble hasheo.
   *
   * El hasheo manual se hace en el controlador antes de crear el usuario:
   *
   * @example
   * ```typescript
   * // En el controlador de registro:
   * const passwordHasheada = await hash.make(datos.password)
   * const usuario = await User.create({
   *   email: datos.email,
   *   password: passwordHasheada,
   *   // ... otros campos
   * })
   * ```
   */
}
