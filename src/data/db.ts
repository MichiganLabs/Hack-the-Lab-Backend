import { Pool } from "pg";
import { camelizeKeys } from "utils";

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASS,
  port: parseInt(process.env.POSTGRES_PORT),
});

export const pgQuery = async (text: string, params: any) => {
  const result = await pool.query(text, params);

  // Convert snake_case column names to camelCase for interfaces.
  result.rows = result.rows.map(row => camelizeKeys(row));

  return result.rows;
};
