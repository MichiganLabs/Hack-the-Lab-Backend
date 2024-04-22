import { Pool } from "pg";
import humps from "humps";

const { POSTGRES_HOST, POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_PORT } = process.env;

const pool = new Pool({
  user: POSTGRES_USER,
  host: POSTGRES_HOST,
  database: POSTGRES_DB,
  password: POSTGRES_PASSWORD,
  port: parseInt(POSTGRES_PORT),
});

export const pgQuery = async (text: string, params: any) => {
  const start = Date.now();

  const result = await pool.query(text, params);

  result.rows = result.rows.map(row => humps.camelizeKeys(row));

  const duration = Date.now() - start;
  console.log("executed query", { text, params, duration, rows: result.rowCount });

  return result.rows;
};
