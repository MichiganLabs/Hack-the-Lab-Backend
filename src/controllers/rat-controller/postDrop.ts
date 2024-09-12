import { ActionResponse, RatActionRequest } from "hackthelab";
import { RatService } from "services";
import { asyncHandler, rethrowOrCreateError } from "utils";

/**
 * @swagger
 * /v1/rat/drop:
 *   post:
 *     tags: [Rat]
 *     summary: Attempts to drop a cheese.
 *     description: Cheese will be dropped if the rat is holding a cheese and is currently positioned at a cell of type `EXIT`, otherwise the action will fail.
 *                  After a cheese is successfully dropped, the rat will be free to grab another cheese.
 *                  <br><br>
 *                  **Note:** Cheese will not automatically be dropped when the rat exits the maze.
 *     requestBody:
 *       description: Drop request.
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
 *
 */
const postDrop = asyncHandler(async (req, res) => {
  const { user, maze, ratPosition } = req as RatActionRequest;

  try {
    // Attempt to drop the cheese.
    const dropResult = await RatService.dropCheese(user.id, maze, ratPosition);

    // Get the rat's current position and surroundings after the rat has grabbed (or not) the cheese.
    const cell = await RatService.getCellAtPosition(maze, ratPosition, user.id);

    const response: ActionResponse = {
      success: dropResult,
      cell,
    };

    res.status(200).json(response);
  } catch (e) {
    console.error(e);
    throw rethrowOrCreateError(e, 500, "Server Error", "An error occurred while trying to drop.");
  }
});

export default postDrop;
