import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

export async function seed(knex) {
  // Create admin user with credentials from environment variables
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@pawpk.com';
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (!adminPassword) {
    console.warn('WARNING: ADMIN_PASSWORD not set in environment. Using a random password.');
    console.warn('Set ADMIN_PASSWORD in .env file before running seeds in production.');
  }
  
  // Generate a secure random password if not provided
  const password = adminPassword || require('crypto').randomBytes(16).toString('hex');
  const password_hash = await bcrypt.hash(password, 10);
  
  await knex('users').insert({
    name: 'Admin User',
    email: adminEmail,
    password_hash,
    role: 'admin'
  }).onConflict('email').ignore();
  
  if (!adminPassword) {
    console.log(`Admin user created with email: ${adminEmail}`);
    console.log(`Generated password: ${password}`);
    console.log('IMPORTANT: Save this password! It will not be shown again.');
  }
}

