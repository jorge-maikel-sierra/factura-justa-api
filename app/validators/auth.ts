import vine from '@vinejs/vine'

/**
 * Validador para el registro de nuevos usuarios (autenticación tradicional)
 */
export const registroValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email().normalizeEmail(),
    password: vine.string().minLength(8),
    fullName: vine.string().trim().minLength(2).optional(),
  })
)

/**
 * Validador para el login de usuarios existentes
 */
export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email().normalizeEmail(),
    password: vine.string().minLength(1),
  })
)
