import { AllActionResponseItem, MazeRequest } from "hackthelab";
import { MazeService, ScoreService } from "services";
import { asyncHandler } from "utils";
import { rethrowOrCreateError } from "utils/create-error";

/**
 * @swagger
 * /v1/maze/{mazeId}/actions:
 *   get:
 *     tags: [Maze (ADMIN)]
 *     summary: Returns recorded actions and a maze.
 *     parameters:
 *       - $ref: '#/components/parameters/MazeRequestPathBase'
 *     responses:
 *       200:
 *         description: Actions successful
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AllActionResponseItem'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
const getAllActions = asyncHandler(async (req, res) => {
  const { maze } = req as MazeRequest;

  try {
    const actions = await MazeService.getAllActions(maze.id);

    const response: AllActionResponseItem[] = actions.map(user => ({
      ...user,
      score: ScoreService.calculateScore(user.actions),
    }));

    res.status(200).json(response);
  } catch (e) {
    console.error(e);
    throw rethrowOrCreateError(e, 500, "Server Error", "An error occurred while trying to fetch actions.");
  }
});

export default getAllActions;