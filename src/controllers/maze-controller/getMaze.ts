import { MazeRequest } from "hackthelab";
import { asyncHandler } from "utils";

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
const getMaze = asyncHandler(async (req, res) => {
  const { maze } = req as MazeRequest;

  res.status(200).json(maze);
});

export default getMaze;
