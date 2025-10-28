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

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router.get('/users', async () => {
  const users = await User.query().orderBy('id', 'asc')
  return users.map((u) => ({ id: u.id, fullName: u.fullName, email: u.email }))
})
