export function up(knex) {
  return knex.schema.createTable('product_images', (table) => {
    table.increments('id').primary();
    table.integer('product_id').unsigned().notNullable();
    table.string('url', 500).notNullable();
    table.string('size_label', 50).notNullable(); // Changed from enum for SQL Server
    table.timestamps(true, true);
    table.foreign('product_id').references('id').inTable('products').onDelete('CASCADE');
    table.index('product_id');
  });
}

export function down(knex) {
  return knex.schema.dropTable('product_images');
}

