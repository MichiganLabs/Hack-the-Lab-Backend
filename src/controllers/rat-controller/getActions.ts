import { ActionsResponse, MazeRequest } from "hackthelab";
import { MazeService } from "services";

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
const getActions = async (req: MazeRequest, res, next) => {

  try {
    const actions = await MazeService.getActions(req.user.id, req.maze.id);
    const score = MazeService.getScore(req.user.id, req.maze, actions);

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
