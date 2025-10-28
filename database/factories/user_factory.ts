import User from '#models/user'
import factory from '@adonisjs/lucid/factories'

export const UserFactory = factory
  .define(User, ({ faker }) => {
    return {
      fullName: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      password: 'secret123',
    }
  })
  .state('withName', (user: User) => {
    user.fullName = user.fullName ?? 'Usuario Demo'
  })
  .build()
