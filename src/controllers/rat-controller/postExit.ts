import { ActionResponse, RatActionRequest } from "hackthelab";
import { RatService } from "services";
import { getCellAtPosition } from "services/rat-service";

/**
 * @swagger
 * /v1/rat/exit:
 *   post:
 *     tags: [Rat]
 *     summary: Gives a rat the ability to exit a maze.
 *     requestBody:
 *       description: Exit request.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MazeRequestBodySchema'
 *     responses:
 *       200:
 *         description: Exit successful.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ActionResponse'
 *       400:
 *         description: Invalid request.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestResponse'
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       500:
 *         description: Internal server error.
 */
const postExit = async (req: RatActionRequest, res, next) => {
  try {
    // Attempt to exit the maze.
    const exitResult = await RatService.exitMaze(req.user.id, req.maze, req.ratPosition);

    // Get the rat's current position and surroundings after the rat has exited (or not) the maze.
    const cell = await getCellAtPosition(req.maze, req.ratPosition, req.user.id);

    const response: ActionResponse = {
      success: exitResult,
      cell,
    };

    res.status(200).json(response);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }

  next();
  return;
};

export default postExit;
