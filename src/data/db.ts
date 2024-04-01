import { Pool } from "pg";
import { setQueryCache } from "./cache";

const {
  POSTGRES_HOST,
  POSTGRES_DB,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_PORT,
} = process.env;

const pool = new Pool({
  user: POSTGRES_USER,
  host: POSTGRES_HOST,
  database: POSTGRES_DB,
  password: POSTGRES_PASSWORD,
  port: parseInt(POSTGRES_PORT),
});

export const _query = async (text: string, params: any, hash: string) => {
  const start = Date.now();

  let result = await pool.query(text, params);

  const duration = Date.now() - start;
  console.log("executed query", { text, duration, rows: result.rowCount });

  await setQueryCache(hash, result.rows);

  return result.rows;
};