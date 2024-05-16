import { ActionResponse, RatActionRequest } from "hackthelab";
import { RatService } from "services";
import { ProblemDetailsError, asyncHandler, createError } from "utils";

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
const postEat = asyncHandler(async (req, res) => {
  const { user, maze, ratPosition } = req as RatActionRequest;

  try {
    // Attempt to eat the cheese.
    const eatResult = await RatService.eatCheese(user.id, maze, ratPosition);

    // Get the rat's current position and surroundings after the rat has eaten (or not) the cheese.
    const cell = await RatService.getCellAtPosition(maze, ratPosition, user.id);

    const response: ActionResponse = {
      success: eatResult,
      cell,
    };

    res.status(200).json(response);
  } catch (e) {
    if (e instanceof ProblemDetailsError) throw e;
    console.error(e);
    throw createError(500, "Server Error", "An error occurred while trying to eat.");
  }
});

export default postEat;
