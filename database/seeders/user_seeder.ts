import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { UserFactory } from '../factories/user_factory.js'

export default class extends BaseSeeder {
  public static environment: string[] = ['development', 'test']

  public async run() {
    await UserFactory.createMany(3)
  }
}
