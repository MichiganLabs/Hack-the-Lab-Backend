import { Pool } from "pg";
import { camelizeKeys } from "utils";

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: parseInt(process.env.POSTGRES_PORT),
});

export const pgQuery = async <T = any>(text: string, params: any): Promise<T> => {
  const result = await pool.query(text, params);

  // Convert snake_case column names to camelCase for interfaces.
  return result.rows.map(row => camelizeKeys(row)) as T;
};
