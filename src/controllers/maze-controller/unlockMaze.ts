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
    res.sendStatus(403);
    return next();
  }

  await MazeService.unlockMaze(req.maze.id);

  res.status(200);

  return next();
};

export default unlockMaze;
