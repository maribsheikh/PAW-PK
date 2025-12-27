export function up(knex) {
  return knex.schema.createTable("users", (table) => {
    table.increments("id").primary();
    table.string("name", 255).notNullable();
    table.string("email", 255).notNullable().unique();
    table.string("password_hash", 255).notNullable();
    table.string("role", 50).defaultTo("customer"); // Changed from enum for SQL Server
    table.timestamps(true, true);
    table.index("email");
  });
}

export function down(knex) {
  return knex.schema.dropTable("users");
}
