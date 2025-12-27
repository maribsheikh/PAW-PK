export function up(knex) {
  return knex.schema.table("product_variants", (table) => {
    table.string("product_code", 50).nullable();
    table.index("product_code");
  });
}

export function down(knex) {
  return knex.schema.table("product_variants", (table) => {
    table.dropColumn("product_code");
  });
}
