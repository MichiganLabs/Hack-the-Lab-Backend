import { Direction } from "@enums";
import { ActionResponse, RatActionRequest } from "hackthelab";
import { RatService } from "services";
import { asyncHandler, rethrowOrCreateError } from "utils";
import { convertToDirection } from "utils/converters";
import { body, matchedData } from "utils/custom-validator";

/**
 * @swagger
 * components:
 *   schemas:
 *     MoveRequest:
 *       type: object
 *       allOf:
 *         - $ref: '#/components/schemas/MazeRequest'
 *       properties:
 *         direction:
 *           $ref: '#/components/schemas/Direction'
 */
interface MoveRequestBody {
  direction: Direction;
}

// prettier-ignore
export const moveSchema = [
  body("direction").isDirection()
];

/**
 * @swagger
 * /v1/rat/move:
 *   post:
 *     tags: [Rat]
 *     summary: Attempts to move in a direction.
 *     description: The rat will move in the provided direction if the cell in that direction is not a wall, otherwise the action will fail.
 *     requestBody:
 *       description: Move request.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MoveRequest'
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
const postMove = asyncHandler(async (req, res) => {
  const { user, maze, ratPosition } = req as RatActionRequest;

  const data = matchedData(req) as MoveRequestBody;

  data.direction = convertToDirection(data.direction);

  try {
    // Attempt to move user's rat in mazeId with provided direction. If move fails, returns null.
    const moveResult = await RatService.moveRat(user.id, maze, ratPosition, data.direction);

    // Get the current cell after the rat has moved.
    const cell = await RatService.getCellAtPosition(maze, ratPosition, user.id);

    const response: ActionResponse = {
      success: moveResult,
      cell,
    };

    res.status(200).json(response);
  } catch (e) {
    console.error(e);
    throw rethrowOrCreateError(e, 500, "Server Error", "An error occurred while trying to move.");
  }
});

export default postMove;
