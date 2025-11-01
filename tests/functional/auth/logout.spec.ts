import { test } from '@japa/runner'
import User from '#models/user'
import AuthService from '#services/auth_service'
import db from '@adonisjs/lucid/services/db'

test.group('Auth Controller - Logout', (group) => {
  let testUser: User
  let authToken: string
  let userEmail: string

  group.each.setup(async () => {
    // ✅ Email único para cada test
    userEmail = `logout-${Date.now()}@test.com`

    testUser = await User.create({
      email: userEmail,
      password: 'Password123!',
      fullName: 'Logout Test User',
      provider: 'local',
      isActive: true,
    })

    // Generar token para el usuario
    const authService = new AuthService()
    const token = await authService.generarTokenAcceso(testUser)
    authToken = token.value.release()
  })

  group.each.teardown(async () => {
    // ✅ Limpiar de forma específica en lugar de truncate
    await db.rawQuery('DELETE FROM auth_access_tokens WHERE tokenable_id = ?', [testUser.id])
    await db.rawQuery('DELETE FROM users WHERE email = ?', [userEmail])
  })

  test('debería cerrar sesión exitosamente', async ({ client }) => {
    const response = await client.post('/auth/logout').bearerToken(authToken)

    response.assertStatus(200)
    response.assertBodyContains({
      estado: 'OK',
      mensaje: 'Sesión cerrada exitosamente',
    })
  })

  test('debería fallar sin token de autenticación', async ({ client }) => {
    const response = await client.post('/auth/logout')

    // ✅ Solo verificar el status code
    response.assertStatus(401)
  })
})
