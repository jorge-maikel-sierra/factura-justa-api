import { test } from '@japa/runner'
import User from '#models/user'
import AuthService from '#services/auth_service'
// Importa una librería para generar identificadores únicos, como uuid o simplemente usa Date.now()

test.group('AuthService', (group) => {
  let authService: AuthService
  let testUser: User
  let uniqueEmail: string // Declara la variable para el email único

  group.each.setup(async () => {
    authService = new AuthService()
    // 💡 GENERAR UN EMAIL ÚNICO PARA CADA PRUEBA
    uniqueEmail = `service_${Date.now()}@test.com`

    testUser = await User.create({
      email: uniqueEmail, // Usar el email único
      password: 'Password123!',
      fullName: 'Service Test User',
      provider: 'local',
      isActive: true,
    })
  })

  group.each.teardown(async () => {
    // 💡 Alternativamente, puedes eliminar solo al usuario creado si hay más datos
    await testUser.delete()
    // O puedes mantener el truncate si quieres una limpieza total.
    // await User.truncate()
  })

  test('debería generar token de acceso válido', async ({ assert }) => {
    const token = await authService.generarTokenAcceso(testUser)

    assert.exists(token.value)
    assert.exists(token.expiresAt)
    assert.isTrue(token.expiresAt! > new Date())
  })

  test('el token debería tener expiración de 7 días', async ({ assert }) => {
    const token = await authService.generarTokenAcceso(testUser)
    const expiresAt = token.expiresAt!
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    // Verificar que la expiración es aproximadamente 7 días
    const diff = Math.abs(expiresAt.getTime() - sevenDaysFromNow.getTime())
    assert.isTrue(diff < 1000) // Menos de 1 segundo de diferencia
  })
})
