import { test } from '@japa/runner'
import User from '#models/user'
import db from '@adonisjs/lucid/services/db'

test.group('Auth Controller - Login', (group) => {
  let userEmail: string

  group.each.setup(async () => {
    // ✅ Email único para cada test
    userEmail = `login-${Date.now()}@test.com`
  })

  group.each.teardown(async () => {
    // ✅ Limpiar datos específicos (no truncate)
    await db.rawQuery(
      'DELETE FROM auth_access_tokens WHERE tokenable_id IN (SELECT id FROM users WHERE email LIKE ?)',
      [`login-%@test.com`]
    )
    await db.rawQuery('DELETE FROM users WHERE email LIKE ?', [`login-%@test.com`])
    await db.rawQuery('DELETE FROM users WHERE email = ?', ['inactive@test.com'])
  })

  test('debería hacer login exitosamente con credenciales válidas', async ({ client }) => {
    // ✅ Crear usuario SIN hashear manualmente (el modelo lo hace)
    const user = await User.create({
      email: userEmail,
      password: 'Password123!', // El modelo hasheará esto automáticamente
      fullName: 'Login Test User',
      provider: 'local',
      isActive: true,
    })

    const response = await client.post('/auth/login').json({
      email: userEmail,
      password: 'Password123!',
    })

    response.assertStatus(200)
    response.assertBodyContains({
      estado: 'OK',
      mensaje: 'Inicio de sesión exitoso',
      datos: {
        usuario: {
          email: userEmail,
        },
        token: {
          tipo: 'bearer',
        },
      },
    })
  })

  test('debería fallar con credenciales incorrectas', async ({ client }) => {
    await User.create({
      email: userEmail,
      password: 'Password123!',
      fullName: 'Login Test User',
      provider: 'local',
      isActive: true,
    })

    const response = await client.post('/auth/login').json({
      email: userEmail,
      password: 'password-incorrecta',
    })

    response.assertStatus(400)
    response.assertBodyContains({
      estado: 'ERROR',
      mensaje: 'Credenciales inválidas',
    })
  })

  test('debería fallar con usuario inactivo', async ({ client }) => {
    await User.create({
      email: 'inactive@test.com',
      password: 'Password123!',
      fullName: 'Inactive User',
      provider: 'local',
      isActive: false,
    })

    const response = await client.post('/auth/login').json({
      email: 'inactive@test.com',
      password: 'Password123!',
    })

    response.assertStatus(403)
    response.assertBodyContains({
      estado: 'ERROR',
      mensaje: 'Usuario inactivo. Contacte al administrador.',
    })
  })
})
