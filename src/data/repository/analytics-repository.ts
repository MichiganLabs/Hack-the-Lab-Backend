import { pgQuery } from "data/db";

export const insert = async (
  userId: number,
  mazeId: string,
  httpMethod: string,
  httpPath: string,
  httpParams: any,
  httpBody: string,
  statusCode: number,
) => {
  const result = await pgQuery(
    "INSERT INTO analytics (user_id, maze_id, method, path, params, body, status_code) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id",
    [userId, mazeId, httpMethod, httpPath, httpParams, httpBody, statusCode],
  );

  // Return the ID of the inserted record.
  return result[0].id;
};
