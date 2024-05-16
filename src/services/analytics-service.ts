import { AnalyticsRepository } from "data/repository";
import { Request, Response } from "express";

export const insertInvocation = (req: Request, res: Response): Promise<number> => {
  let mazeId: string = null;

  if (req.params && req.params["mazeId"]) {
    mazeId = req.params["mazeId"];
  } else if (req.body && req.body["mazeId"]) {
    mazeId = req.body["mazeId"];
  }

  return AnalyticsRepository.insert(req.user.id, mazeId, req.method, req.path, req.params, req.body, res.statusCode);
};
