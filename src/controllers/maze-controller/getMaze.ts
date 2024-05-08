import { MazeRequest } from "hackthelab";

/**
 * @swagger
 * /v1/maze/{mazeId}:
 *   get:
 *     tags: [Maze (ADMIN)]
 *     summary: Returns a maze
 *     parameters:
 *       - $ref: '#/components/parameters/MazeRequestPathBase'
 *     responses:
 *       200:
 *         description: Fetch successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Maze'
 */
const getMaze = async (req: MazeRequest, res, next) => {
  res.status(200).json(req.maze);

  return next();
};

export default getMaze;
