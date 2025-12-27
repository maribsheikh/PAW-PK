import bcrypt from "bcrypt";

export async function seed(knex) {
  // Create admin user
  const password_hash = await bcrypt.hash("admin123", 10);

  await knex("users")
    .insert({
      name: "Admin User",
      email: "admin@pawpk.com",
      password_hash,
      role: "admin",
    })
    .onConflict("email")
    .ignore();
}
