import { MazeRequest } from "hackthelab";
import { asyncHandler } from "utils";

/**
 * @swagger
 * /v1/maze/{mazeId}:
 *   get:
 *     tags: [Maze (SANDBOX)]
 *     summary: Returns maze information for a given maze ID. (Sandbox only)
 *     parameters:
 *       - $ref: '#/components/parameters/MazeRequestPathBase'
 *     responses:
 *       200:
 *         description: Fetch successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Maze'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
const getMaze = asyncHandler(async (req, res) => {
  const { maze } = req as MazeRequest;

  res.status(200).json(maze);
});

export default getMaze;
