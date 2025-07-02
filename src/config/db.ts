import { Sequelize } from 'sequelize';
import { DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME } from '../constants/env';

export const sequelize = new Sequelize(
  DB_NAME,
  DB_USER,
  DB_PASS,
  {
    host: DB_HOST,
    port: Number(DB_PORT),
    dialect: 'postgres',
    logging: false,
    define: {
      timestamps: true,
    },
    pool: {
      max: 10,
      min: 2,
      idle: 100000,
      acquire: 30000,
      evict: 1000,
    },
  }
)