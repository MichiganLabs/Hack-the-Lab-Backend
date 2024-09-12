import { ActionResponse, RatActionRequest } from "hackthelab";
import { RatService } from "services";
import { asyncHandler, rethrowOrCreateError } from "utils";

/**
 * @swagger
 * /v1/rat/grab:
 *   post:
 *     tags: [Rat]
 *     summary: Attempts to grab a cheese.
 *     description: Cheese will be grabbed if the rat is currently positioned at a cell of type `CHEESE` and is not already holding a cheese, otherwise the action will fail.<br>
 *                  <br>
 *                  After a cheese is successfully grabbed, the cell type will be updated to `OPEN`.
 *
 *     requestBody:
 *       description: Grab request.
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
const postGrab = asyncHandler(async (req, res) => {
  const { user, maze, ratPosition } = req as RatActionRequest;

  try {
    // Attempt to grab the cheese.
    const grabResult = await RatService.grabCheese(user.id, maze, ratPosition);

    // Get the rat's current position and surroundings after the rat has grabbed (or not) the cheese.
    const cell = await RatService.getCellAtPosition(maze, ratPosition, user.id);

    const response: ActionResponse = {
      success: grabResult,
      cell,
    };

    res.status(200).json(response);
  } catch (e) {
    console.error(e);
    throw rethrowOrCreateError(e, 500, "Server Error", "An error occurred while trying to grab.");
  }
});

export default postGrab;
