import { ActionResponse, RatActionRequest } from "hackthelab";
import { RatService } from "services";
import { asyncHandler, rethrowOrCreateError } from "utils";

/**
 * @swagger
 * /v1/rat/exit:
 *   post:
 *     tags: [Rat]
 *     summary: Attempts to exit a maze.
 *     description: The rat will exit a maze if the rat is currently positioned at a cell of type `EXIT`, otherwise the action will fail.
 *                  After the rat has exited the maze, the rat will no longer be able to perform any actions for the maze.
 *     requestBody:
 *       description: Exit request.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MazeRequest'
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ActionResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/ServerError'
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
    console.error(e);
    throw rethrowOrCreateError(e, 500, "Server Error", "An error occurred while trying to exit.");
  }
});

export default postExit;
