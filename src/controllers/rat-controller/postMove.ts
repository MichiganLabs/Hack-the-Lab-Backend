import { Direction } from "@enums";
import { ActionResponse, RatActionRequest } from "hackthelab";
import { RatService } from "services";
import { ProblemDetailsError, asyncHandler, createError } from "utils";
import { body, matchedData } from "utils/custom-validator";

/**
 * @swagger
 * components:
 *   schemas:
 *     MoveRequestBody:
 *       type: object
 *       allOf:
 *         - $ref: '#/components/schemas/MazeRequestBodySchema'
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
 *     summary: Moves a rat in a direction for a specific maze.
 *     requestBody:
 *       description: Move request.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MoveRequestBody'
 *     responses:
 *       200:
 *         description: Move successful
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
const postMove = asyncHandler(async (req, res) => {
  const { user, maze, ratPosition } = req as RatActionRequest;

  const data = matchedData(req) as MoveRequestBody;

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
    if (e instanceof ProblemDetailsError) throw e;
    console.error(e);
    throw createError(500, "An error occurred while trying to move.");
  }
});

export default postMove;
