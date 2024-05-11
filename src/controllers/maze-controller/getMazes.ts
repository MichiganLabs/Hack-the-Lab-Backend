import { Role } from "@enums";
import { NextFunction, Request, Response } from "express";
import { MazeListItem } from "hackthelab";
import { MazeService } from "services";
import { query } from "utils/custom-validator";

export const mazesSchema = [
  query("role")
    .optional()
    .isString()
    .withMessage("'role' must be a string")
    .custom(value => {
      if (!Object.values(Role).includes(value)) {
        throw new Error("'role' must be a valid Role");
      }
      return true;
    }),
];

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
 *                 $ref: '#/components/schemas/MazeListItem'
 */
const getMazes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get the mazes
    let role = req.user.role;

    if (req.user.role == Role.Admin) {
      role = (req.query.role as Role) ?? Role.Admin;
    }

    const mazes = await MazeService.getMazes(role);

    const mazeList: MazeListItem[] = Object.values(mazes).map(maze => ({
      id: maze.id,
      dimensions: maze.dimensions,
    }));

    res.status(200).json(mazeList);
  } catch (e) {
    console.error(e);
    res.sendStatus(500).json({ error: "Internal server error" });
  }

  next();
  return;
};

export default getMazes;
