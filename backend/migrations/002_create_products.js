export function up(knex) {
  return knex.schema.createTable('products', (table) => {
    table.increments('id').primary();
    table.string('title', 255).notNullable();
    table.string('slug', 255).notNullable();
    table.string('sku', 100).notNullable();
    table.text('description');
    table.decimal('price_pkr', 10, 2).notNullable();
    table.string('category', 50).notNullable(); // Changed from enum for SQL Server
    table.integer('stock').defaultTo(0);
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    table.unique('slug');
    table.unique('sku');
    table.index('category');
    table.index('is_active');
  });
}

export function down(knex) {
  return knex.schema.dropTable('products');
}

