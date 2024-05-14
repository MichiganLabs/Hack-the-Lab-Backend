import { MazeRequest } from "hackthelab";
import { MazeService } from "services";

/**
 * @swagger
 * /v1/maze/{mazeId}/lock:
 *   post:
 *     tags: [Maze (ADMIN)]
 *     summary: Locks a maze
 *     parameters:
 *       - $ref: '#/components/parameters/MazeRequestPathBase'
 *     responses:
 *       200:
 *         description: Lock successful
 */
const lockMaze = async (req: MazeRequest, res, next) => {
  const isMazeLocked = await MazeService.isLocked(req.maze.id);

  if (isMazeLocked) {
    res.status(403).json({
      success: false,
      error: `Maze '${req.maze.id}' is already locked.`,
    });
    return next();
  }

  await MazeService.lockMaze(req.maze.id);

  res.status(200).json({
    success: true,
    message: `Maze '${req.maze.id}' has been locked.`,
  });

  return next();
};

export default lockMaze;
