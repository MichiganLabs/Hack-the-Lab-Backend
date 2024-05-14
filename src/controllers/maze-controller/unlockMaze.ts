import { MazeRequest } from "hackthelab";
import { MazeService } from "services";

/**
 * @swagger
 * /v1/maze/{mazeId}/unlock:
 *   post:
 *     tags: [Maze (ADMIN)]
 *     summary: Unlocks a maze
 *     parameters:
 *       - $ref: '#/components/parameters/MazeRequestPathBase'
 *     responses:
 *       200:
 *         description: Unlock successful
 */
const unlockMaze = async (req: MazeRequest, res, next) => {
  const isMazeLocked = await MazeService.isLocked(req.maze.id);

  if (!isMazeLocked) {
    res.status(403).json({
      success: false,
      error: `Maze '${req.maze.id}' is already unlocked.`,
    });
    return next();
  }

  await MazeService.unlockMaze(req.maze.id);

  res.status(200).json({
    success: true,
    message: `Maze '${req.maze.id}' has been unlocked.`,
  });

  return next();
};

export default unlockMaze;
