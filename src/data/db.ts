import { Pool } from "pg";
import { camelizeKeys } from "utils";

const { POSTGRES_HOST, POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_PORT } = process.env;

const pool = new Pool({
  user: POSTGRES_USER,
  host: POSTGRES_HOST,
  database: POSTGRES_DB,
  password: POSTGRES_PASSWORD,
  port: parseInt(POSTGRES_PORT),
});

export const pgQuery = async (text: string, params: any) => {
  const result = await pool.query(text, params);

  // Convert snake_case column names to camelCase for interfaces.
  result.rows = result.rows.map(row => camelizeKeys(row));

  return result.rows;
};
