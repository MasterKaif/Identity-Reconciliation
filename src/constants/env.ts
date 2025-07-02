import dotenv from 'dotenv';
dotenv.config();

export const DB_NAME=process.env.DB_NAME as unknown as string;
export const DB_USER=process.env.DB_USER as unknown as string;
export const DB_PASS=process.env.DB_PASS as unknown as string;
export const DB_HOST=process.env.DB_HOST as unknown as string;
export const DB_PORT=process.env.DB_PORT as unknown as string;

