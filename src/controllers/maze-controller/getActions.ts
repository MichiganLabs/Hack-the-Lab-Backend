import { ActionsResponse, MazeRequest } from "hackthelab";
import { MazeService } from "services";
import { ProblemDetailsError, asyncHandler, createError } from "utils";
import { matchedData, param } from "utils/custom-validator";

interface ActionsRequestBody {
  userId: number;
}

// prettier-ignore
export const actionsSchema = [
  param("userId").isNumeric().withMessage("'userId' must be included in the body of the request."),
];

/**
 * @swagger
 * /v1/maze/{mazeId}/actions/{userId}:
 *   get:
 *     tags: [Maze (ADMIN)]
 *     summary: Returns recorded actions and score for a specific rat in a maze.
 *     parameters:
 *       - $ref: '#/components/parameters/MazeRequestPathBase'
 *       - in: path
 *         name: userId
 *         schemas:
 *           type: string
 *         required: true
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
  const { maze } = req as MazeRequest;
  const data = matchedData(req) as ActionsRequestBody;

  try {
    const actions = await MazeService.getActions(data.userId, maze.id);
    const score = MazeService.getScore(data.userId, maze, actions);

    const response: ActionsResponse = {
      actions,
      score,
    };

    res.status(200).json(response);
  } catch (e) {
    if (e instanceof ProblemDetailsError) throw e;
    console.error(e);
    throw createError(500, "An error occurred while trying to fetch actions.");
  }
});

export default getActions;
