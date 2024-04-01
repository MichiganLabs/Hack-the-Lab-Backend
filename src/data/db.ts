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

// export const getClient = async () => {
//   const client = await pool.connect();
//   const query = client.query;
//   const release = client.release;

//   // set a timeout of 5 seconds, after which we will log this client's last query
//   const timeout = setTimeout(() => {
//     console.error("A client has been checked out for more than 5 seconds!");
//     console.error(
//       `The last executed query on this client was: ${client.lastQuery}`
//     );
//   }, 5000);

//   // monkey patch the query method to keep track of the last query executed
//   client.query = (...args: any[]): any => {
//     client.lastQuery = args;
//     return query.apply(client, args);
//   };

//   client.release = () => {
//     // clear our timeout
//     clearTimeout(timeout);
//     // set the methods back to their old un-monkey-patched version
//     client.query = query;
//     client.release = release;
//     return release.apply(client);
//   }

//   return client;
// };
