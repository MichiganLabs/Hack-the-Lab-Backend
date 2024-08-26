import { ActionsResponse, MazeRequest } from "hackthelab";
import { MazeService, ScoreService } from "services";
import { asyncHandler } from "utils";
import { rethrowOrCreateError } from "utils/create-error";
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
 *     summary: Returns recorded actions and score for a specific user in a maze.
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
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
const getActions = asyncHandler(async (req, res) => {
  const { maze } = req as MazeRequest;
  const data = matchedData(req) as ActionsRequestBody;

  try {
    const actions = await MazeService.getActions(data.userId, maze.id);
    const score = ScoreService.calculateScore(actions);

    const response: ActionsResponse = {
      actions,
      score,
    };

    res.status(200).json(response);
  } catch (e) {
    console.error(e);
    throw rethrowOrCreateError(e, 500, "Server Error", "An error occurred while trying to fetch actions.");
  }
});

export default getActions;
