import { ActionResponse, RatActionRequest } from "hackthelab";
import { RatService } from "services";
import { ProblemDetailsError, asyncHandler, createError } from "utils";

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
const postExit = asyncHandler(async (req, res) => {
  const { user, maze, ratPosition } = req as RatActionRequest;

  try {
    // Attempt to exit the maze.
    const exitResult = await RatService.exitMaze(user.id, maze, ratPosition);

    // Get the rat's current position and surroundings after the rat has exited (or not) the maze.
    const cell = await RatService.getCellAtPosition(maze, ratPosition, user.id);

    const response: ActionResponse = {
      success: exitResult,
      cell,
    };

    res.status(200).json(response);
  } catch (e) {
    if (e instanceof ProblemDetailsError) throw e;
    console.error(e);
    throw createError(500, "An error occurred while trying to exit.");
  }
});

export default postExit;
