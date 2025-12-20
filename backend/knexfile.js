import dotenv from 'dotenv';
dotenv.config();

export default {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './pawpk_dev.sqlite3'
    },
    useNullAsDefault: true,
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './seeds'
    }
  },
  production: {
    client: 'sqlite3',
    connection: {
      filename: process.env.DB_FILE || './pawpk_prod.sqlite3'
    },
    useNullAsDefault: true,
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations'
    }
  }
};

