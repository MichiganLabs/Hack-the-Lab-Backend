import { Environment, Role } from "@enums";
import { NextFunction, Request, Response } from "express";
import { MazeService } from "services";
import { query } from "utils/custom-validator";

export const mazesSchema = [query("env").optional().isEnvironment()];

/**
 * @swagger
 * /v1/mazes:
 *   get:
 *     tags: [Maze]
 *     summary: Returns a list of maze ids.
 *     responses:
 *       200:
 *         description: Fetch successful
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *                 example: "oneTurn"
 */
const getMazes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get the mazes
    let envs = MazeService.getEnvironmentsForRole(req.user.role);

    if (req.user.role == Role.Admin && req.query.env !== undefined) {
      envs = [req.query.env as Environment] ?? Object.values(Environment);
    }

    const mazes = await MazeService.getMazes(envs);

    const mazeList: string[] = Object.values(mazes).map(maze => maze.id);

    res.status(200).json(mazeList);
  } catch (e) {
    console.error(e);
    res.sendStatus(500).json({ error: "Internal server error" });
  }

  next();
  return;
};

export default getMazes;
