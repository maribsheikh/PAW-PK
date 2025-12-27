export function up(knex) {
  return knex.schema.createTable("order_items", (table) => {
    table.increments("id").primary();
    table.integer("order_id").unsigned().notNullable();
    table.integer("product_id").unsigned().notNullable();
    table.decimal("price", 10, 2).notNullable();
    table.integer("quantity").notNullable();
    table.timestamps(true, true);
    table
      .foreign("order_id")
      .references("id")
      .inTable("orders")
      .onDelete("CASCADE");
    table
      .foreign("product_id")
      .references("id")
      .inTable("products")
      .onDelete("CASCADE");
    table.index("order_id");
  });
}

export function down(knex) {
  return knex.schema.dropTable("order_items");
}
