/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import User from '#models/user'
import { middleware } from '#start/kernel'
import AutoSwagger from 'adonis-autoswagger'
import swagger from '#config/swagger'

const AuthController = () => import('#controllers/auth_controller')
const GoogleAuthController = () => import('#controllers/google_auth_controller')

// Documentación Swagger
router.get('/swagger', async () => {
  return AutoSwagger.default.docs(router.toJSON(), swagger)
})

router.get('/docs', async () => {
  return AutoSwagger.default.ui('/swagger', swagger)
})

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router.get('/users', async () => {
  const users = await User.query().orderBy('id', 'asc')
  return users.map((u) => ({ id: u.id, fullName: u.fullName, email: u.email }))
})

// Rutas de autenticación tradicional
router
  .group(() => {
    router.post('/register', [AuthController, 'registro'])
    router.post('/login', [AuthController, 'login'])
    router.post('/logout', [AuthController, 'logout']).use(middleware.auth())
    router.get('/me', [AuthController, 'me']).use(middleware.auth())
  })
  .prefix('/auth')

// Rutas de autenticación social (Google OAuth)
router
  .group(() => {
    router.get('/redirect', [GoogleAuthController, 'redirect'])
    router.get('/callback', [GoogleAuthController, 'callback'])
  })
  .prefix('/auth/google')
