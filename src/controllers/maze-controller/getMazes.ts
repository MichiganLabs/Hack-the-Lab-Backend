import { Role } from "@enums";
import { NextFunction, Request, Response } from "express";
import { MazeService } from "services";
import { query } from "utils/custom-validator";

export const mazesSchema = [query("role").optional().isRole()];

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
    let role = req.user.role;

    if (req.user.role == Role.Admin) {
      role = (req.query.role as Role) ?? Role.Admin;
    }

    const mazes = await MazeService.getMazes(role);

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
