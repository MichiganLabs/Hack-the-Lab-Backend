import { Pool } from "pg";
import { setQueryCache } from "./cache";

const {
  POSTGRES_HOST: PG_HOST,
  POSTGRES_DB: PG_DBNAME,
  POSTGRES_USER: PG_USER,
  POSTGRES_PASSWORD: PG_PASS,
  POSTGRES_PORT: PG_PORT,
} = process.env;

const pool = new Pool({
  user: PG_USER,
  host: PG_HOST,
  database: PG_DBNAME,
  password: PG_PASS,
  port: parseInt(PG_PORT),
});

export const _query = async (text: string, params: any, hash: string) => {
  const start = Date.now();

  let result = await pool.query(text, params);

  const duration = Date.now() - start;
  console.log("executed query", { text, duration, rows: result.rowCount });

  await setQueryCache(hash, result.rows);

  return result.rows;
};