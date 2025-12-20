export function up(knex) {
  return knex.schema.createTable('reviews', (table) => {
    table.increments('id').primary();
    table.integer('product_id').unsigned().notNullable();
    table.integer('user_id').unsigned().notNullable();
    table.integer('rating').notNullable();
    // Rating validation is handled at application level
    table.text('comment');
    table.string('status', 50).defaultTo('pending'); // Changed from enum for SQL Server
    table.timestamps(true, true);
    table.foreign('product_id').references('id').inTable('products').onDelete('CASCADE');
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.index('product_id');
    table.index('status');
  });
}

export function down(knex) {
  return knex.schema.dropTable('reviews');
}

