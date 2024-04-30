import { MazeRequest } from "hackthelab";
import * as MazeService from "services/maze-service";
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
 *     tags: [Maze]
 *     summary: Returns recorded actions for a specific rat in a maze.
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
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Action'
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
const getActions = async (req: MazeRequest, res, next) => {
  const data = matchedData(req) as ActionsRequestBody;

  try {
    const actions = await MazeService.getActions(data.userId, req.maze.id);

    res.status(200).json(actions);
  } catch (e) {
    console.error(e);
    res.sendStatus(500).json({ error: "Internal server error" });
  }

  next();
  return;
};

export default getActions;
