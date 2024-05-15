import { pgQuery } from "data/db";
import { Request, Response } from "express";

export const insertInvocation = async (req: Request, res: Response): Promise<number> => {
  let mazeId: string = null;

  if (req.params && req.params["mazeId"]) {
      mazeId = req.params["mazeId"];
  } else if (req.body && req.body["mazeId"]) {
      mazeId = req.body["mazeId"];
  }

  const result = await pgQuery("INSERT INTO analytics (user_id, maze_id, method, path, params, body, status_code) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id", [
    req.user.id,
    mazeId,
    req.method,
    req.path,
    req.params,
    req.body,
    res.statusCode,
  ]);

  // Return the ID of the inserted record.
  return result[0].id;
};