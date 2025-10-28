import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Hacer password nullable para autenticación social
      table.string('password').nullable().alter()

      // Añadir campos para autenticación social
      table.string('provider', 50).notNullable().defaultTo('local')
      table.string('provider_id', 100).nullable()
      table.boolean('is_active').notNullable().defaultTo(true)

      // Índice único compuesto para provider + provider_id
      table.unique(['provider', 'provider_id'], {
        indexName: 'users_provider_provider_id_unique',
      })
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      // Revertir cambios
      table.dropUnique(['provider', 'provider_id'], 'users_provider_provider_id_unique')
      table.dropColumn('is_active')
      table.dropColumn('provider_id')
      table.dropColumn('provider')
      table.string('password').notNullable().alter()
    })
  }
}
