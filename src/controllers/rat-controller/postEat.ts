import { ActionResponse, RatActionRequest } from "hackthelab";
import { RatService } from "services";
import { asyncHandler, rethrowOrCreateError } from "utils";

/**
 * @swagger
 * /v1/rat/eat:
 *   post:
 *     tags: [Rat]
 *     summary: Attempts to eat a cheese.
 *     description: Cheese will be eaten if either the rat is currently positioned at a cell of type `CHEESE` or currently holding a cheese.
 *                  If the both are true, the cheese at the rat's current position will be eaten and the cheese held by the rat will remain.
 *                  After a cheese is successfully eaten, the cell type will be updated to `OPEN`.
 *     requestBody:
 *       description: Eat request.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MazeRequest'
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ActionResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/ServerError'
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
    console.error(e);
    throw rethrowOrCreateError(e, 500, "Server Error", "An error occurred while trying to eat.");
  }
});

export default postEat;
