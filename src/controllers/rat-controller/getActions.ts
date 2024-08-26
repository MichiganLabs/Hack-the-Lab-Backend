import { ActionsResponse, MazeRequest } from "hackthelab";
import { MazeService, ScoreService } from "services";
import { asyncHandler, rethrowOrCreateError } from "utils";

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
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
const getActions = asyncHandler(async (req, res) => {
  const { user, maze } = req as MazeRequest;

  try {
    const actions = await MazeService.getActions(user.id, maze.id);
    const score = ScoreService.calculateScore(actions);

    const response: ActionsResponse = {
      actions,
      score,
    };

    res.status(200).json(response);
  } catch (e) {
    console.error(e);
    throw rethrowOrCreateError(e, 500, "Server Error", "An error occurred while trying to get actions.");
  }
});

export default getActions;
