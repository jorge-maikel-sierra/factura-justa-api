import { test } from '@japa/runner'
import User from '#models/user'
import AuthService from '#services/auth_service'
import db from '@adonisjs/lucid/services/db'

test.group('Auth Controller - Me', (group) => {
  let testUser: User
  let authToken: string
  let userEmail: string

  group.each.setup(async () => {
    userEmail = `me-${Date.now()}@test.com`

    testUser = await User.create({
      email: userEmail,
      password: 'Password123!',
      fullName: 'Me Test User',
      provider: 'local',
      isActive: true,
    })

    const authService = new AuthService()
    const tokenResponse = await authService.generarTokenAcceso(testUser)

    if (!tokenResponse.value) {
      throw new Error('El token generado no tiene valor')
    }
    authToken = tokenResponse.value.release()
  })

  group.each.teardown(async () => {
    await db.rawQuery('DELETE FROM auth_access_tokens WHERE tokenable_id = ?', [testUser.id])
    await db.rawQuery('DELETE FROM users WHERE email = ?', [userEmail])
  })

  test('debería obtener información del usuario autenticado', async ({ client }) => {
    const response = await client.get('/auth/me').bearerToken(authToken)

    console.log('📡 Status:', response.status())

    if (response.status() !== 200) {
      console.log('❌ Body:', response.body())
    }

    response.assertStatus(200)
    response.assertBodyContains({
      estado: 'OK',
      mensaje: 'Usuario obtenido exitosamente',
      datos: {
        usuario: {
          id: testUser.id,
          email: testUser.email,
          fullName: testUser.fullName,
          provider: testUser.provider,
        },
      },
    })
  })
})
