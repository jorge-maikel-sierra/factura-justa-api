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

    // ✅ SOLUCIÓN: tokenResponse es directamente el AccessToken
    // La propiedad 'value' es un objeto Secret que contiene el token
    // Necesitas llamar a .release() para obtener el string
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
