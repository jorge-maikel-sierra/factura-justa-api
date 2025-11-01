import { test } from '@japa/runner'
import User from '#models/user'
import db from '@adonisjs/lucid/services/db'

test.group('Auth Controller - Registro', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('debería registrar un usuario exitosamente', async ({ client, assert }) => {
    const userData = {
      email: 'test@example.com',
      password: 'Password123!',
      fullName: 'Test User',
    }

    const response = await client.post('/auth/register').json(userData)

    response.assertStatus(201)
    response.assertBodyContains({
      estado: 'OK',
      mensaje: 'Usuario registrado exitosamente',
      datos: {
        usuario: {
          email: userData.email,
          fullName: userData.fullName,
          provider: 'local',
        },
        token: {
          tipo: 'bearer',
        },
      },
    })

    // Verificar que el usuario se creó en la base de datos
    const user = await User.findBy('email', userData.email)
    assert.isNotNull(user)
    assert.equal(user?.email, userData.email)
    assert.equal(user?.fullName, userData.fullName)
  })

  test('debería fallar cuando el email ya existe', async ({ client }) => {
    const userData = {
      email: 'existente@example.com',
      password: 'Password123!',
      fullName: 'Usuario Existente',
    }

    // Crear usuario primero
    await User.create(userData)

    // Intentar crear el mismo usuario otra vez
    const response = await client.post('/auth/register').json(userData)

    response.assertStatus(409)
    response.assertBodyContains({
      estado: 'ERROR',
      mensaje: 'El correo electrónico ya está registrado',
    })
  })

  test('debería fallar con datos de validación inválidos', async ({ client }) => {
    const invalidData = {
      email: 'email-invalido',
      password: '123', // Contraseña muy corta
      fullName: '', // Nombre vacío
    }

    const response = await client.post('/auth/register').json(invalidData)

    response.assertStatus(422)
    response.assertBodyContains({
      estado: 'ERROR',
    })
  })
})
