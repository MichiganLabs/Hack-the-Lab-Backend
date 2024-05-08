import { ActionsResponse, MazeRequest } from "hackthelab";
import { MazeService } from "services";
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
export const getActions = async (req: MazeRequest, res, next) => {
  const data = matchedData(req) as ActionsRequestBody;

  try {
    const actions = await MazeService.getActions(data.userId, req.maze.id);
    const score = await MazeService.getScore(data.userId, req.maze, actions);

    const response: ActionsResponse = {
      actions,
      score,
    };

    res.status(200).json(response);
  } catch (e) {
    console.error(e);
    res.sendStatus(500).json({ error: "Internal server error" });
  }

  next();
  return;
};

export default getActions;
