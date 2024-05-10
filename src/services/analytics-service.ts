import { pgQuery } from "data/db";
import { Request, Response } from "express";

export const insertInvocation = async (req: Request, mazeId: number, res: Response): Promise<number> => {
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