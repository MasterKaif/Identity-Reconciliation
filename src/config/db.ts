import { Sequelize } from 'sequelize-typescript';
import { Contact } from '../models/Contact';
import { DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME } from '../constants/env'


export const sequelize = new Sequelize({
  dialect: 'postgres',
  host: DB_HOST,
  username: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  port: Number(DB_PORT),
  models: [Contact],
  logging: false,
  define: {
    timestamps: true
  },
  pool: {
    max: 10,
    min: 2,
    idle: 100000,
    acquire: 30000,
    evict: 1000
  }
});
