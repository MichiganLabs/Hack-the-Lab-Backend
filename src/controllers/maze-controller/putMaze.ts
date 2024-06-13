import { body, matchedData } from "express-validator";
import { MazeRequest } from "hackthelab";
import { MazeService } from "services";

/**
 * @swagger
 * components:
 *   schemas:
 *     MazeUpdateRequestBody:
 *       properties:
 *         locked:
 *           type: boolean
 *           example: true
 */
export const mazeUpdateSchema = [body("locked").isBoolean().withMessage("'locked' must be provided and a boolean type.")];

/**
 * @swagger
 * /v1/maze/{mazeId}:
 *   put:
 *     tags: [Maze (ADMIN)]
 *     summary: Updates a maze.
 *     parameters:
 *       - $ref: '#/components/parameters/MazeRequestPathBase'
 *     requestBody:
 *       description: New maze properties.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MazeUpdateRequestBody'
 *     responses:
 *       400:
 *         description: Bad request.
 *       403:
 *         description: Forbidden, update unsuccessful.
 *       200:
 *         description: Update successful
 */
const putMaze = async (req: MazeRequest, res, next) => {
  const updateRequest = matchedData(req);
  const action = updateRequest.locked ? "locked" : "unlocked";

  const isMazeLocked = await MazeService.isLocked(req.maze.id);

  if (updateRequest.locked == isMazeLocked) {
    res.status(403).json({
      status: false,
      error: `Maze '${req.maze.id}' is already ${action}`,
    });

    return next();
  }

  await MazeService.setLocked(req.maze.id, updateRequest.locked);

  res.status(200).json({
    success: true,
    message: `Maze '${req.maze.id}' has been ${action}.`,
  });

  return next();
};

export default putMaze;
