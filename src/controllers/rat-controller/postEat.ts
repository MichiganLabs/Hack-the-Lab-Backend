import { ActionResponse, RatActionRequest } from "hackthelab";
import { MazeService, RatService } from "services";

/**
 * @swagger
 * /v1/rat/eat:
 *   post:
 *     tags: [Rat]
 *     summary: Gives a rat the ability to eat a cheese (if already on a cheese cell).
 *     requestBody:
 *       description: Eat request.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MazeRequestBodySchema'
 *     responses:
 *       200:
 *         description: Eat successful
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
 *         description: Forbidden
 *       500:
 *         description: Internal server error.
 */
const postEat = async (req: RatActionRequest, res, next) => {

  try {
    // Attempt to move user's rat in mazeId with provided direction. If move fails, returns null.
    const eatResult = await RatService.eatCheese(req.user.id, req.maze, req.ratPosition);

    // Get the rat's current position and surroundings after the rat has eaten (or not) the cheese.
    const cell = MazeService.getCellAtPosition(req.maze, req.ratPosition, req.user.id);

    const response: ActionResponse = {
      success: eatResult,
      cell,
    }

    res.status(200).json(response);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }

  next();
  return;
};

export default postEat;
