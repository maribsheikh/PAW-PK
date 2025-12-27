export function up(knex) {
  return knex.schema.createTable("orders", (table) => {
    table.increments("id").primary();
    table.integer("user_id").unsigned().notNullable();
    table.decimal("total_amount", 10, 2).notNullable();
    table.string("status", 50).defaultTo("pending"); // Changed from enum for SQL Server
    table.text("shipping_address").notNullable(); // JSON stored as text in SQLite
    table.string("payment_method", 50).notNullable();
    table.string("payment_status", 50).defaultTo("pending");
    table.timestamps(true, true);
    table
      .foreign("user_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.index("user_id");
    table.index("status");
  });
}

export function down(knex) {
  return knex.schema.dropTable("orders");
}
