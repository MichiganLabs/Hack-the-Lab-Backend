import { MazeRequest } from "hackthelab";
import { asyncHandler } from "utils";

/**
 * @swagger
 * /v1/maze/{mazeId}:
 *   get:
 *     tags: [Maze (SANDBOX)]
 *     summary: Returns a maze's information.
 *     description: Returns a maze's cells (with type and surroundings), cheese locations, dimensions, start and exit.
 *                  <br><br>
 *                  **Note** This sandbox endpoint is for testing purposes only, not all information provided is accessible during the competition.
 *     parameters:
 *       - $ref: '#/components/parameters/MazeRequestPathBase'
 *     responses:
 *       200:
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
