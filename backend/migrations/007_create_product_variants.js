export function up(knex) {
  return knex.schema.createTable("product_variants", (table) => {
    table.increments("id").primary();
    table.integer("product_id").unsigned().notNullable();
    table.string("size", 50).notNullable(); // 'small', 'medium', 'large' - already string for SQL Server
    table.decimal("price_pkr", 10, 2).notNullable();
    table.integer("stock").defaultTo(0);
    table.string("dimensions", 100); // e.g., "20*16 inches"
    table.timestamps(true, true);
    table
      .foreign("product_id")
      .references("id")
      .inTable("products")
      .onDelete("CASCADE");
    table.unique(["product_id", "size"]);
    table.index("product_id");
  });
}

export function down(knex) {
  return knex.schema.dropTable("product_variants");
}
