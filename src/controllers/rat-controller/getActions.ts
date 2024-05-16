import { ActionsResponse, MazeRequest } from "hackthelab";
import { MazeService } from "services";
import { ProblemDetailsError, asyncHandler, createError } from "utils";

/**
 * @swagger
 * /v1/rat/{mazeId}/actions:
 *   get:
 *     tags: [Rat (SANDBOX)]
 *     summary: Returns recorded actions and score for the rat in a maze.
 *     parameters:
 *       - $ref: '#/components/parameters/MazeRequestPathBase'
 *     responses:
 *       200:
 *         description: Actions successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ActionsResponse'
 *       400:
 *         description: Invalid request body.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BadRequestResponse'
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 */
const getActions = asyncHandler(async (req, res) => {
  const { user, maze } = req as MazeRequest;

  try {
    const actions = await MazeService.getActions(user.id, maze.id);
    const score = MazeService.getScore(user.id, maze, actions);

    const response: ActionsResponse = {
      actions,
      score,
    };

    res.status(200).json(response);
  } catch (e) {
    if (e instanceof ProblemDetailsError) throw e;
    console.error(e);
    throw createError(500, "Server Error", "An error occurred while trying to get actions.");
  }
});

export default getActions;
