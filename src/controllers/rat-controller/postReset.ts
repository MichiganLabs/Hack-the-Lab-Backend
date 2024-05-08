import { MazeRequest } from "hackthelab";
import { RatService } from "services";

/**
 * @swagger
 * /v1/rat/reset:
 *   post:
 *     tags: [Rat (SANDBOX)]
 *     summary: Reset a maze so that it can be solved again
 *     requestBody:
 *       description: Reset request.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MazeRequestBodySchema'
 *     responses:
 *       200:
 *         description: Reset successful.
 *       400:
 *         description: Invalid request.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestResponse'
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error.
 */
const postReset = async (req: MazeRequest, res, next) => {
  try {
    await RatService.resetMaze(req.user.id, req.maze.id);

    res.status(200).json({ message: "Maze was successfully reset" });
  } catch (e) {
    console.error(e);
    res.sendStatus(500).json({ error: "Internal server error" });
  }

  next();
  return;
};

export default postReset;
